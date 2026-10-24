package com.carrental.controller;

import com.carrental.config.VNPayConfig;
import com.carrental.entity.Car;
import com.carrental.entity.CarSlot;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.*;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.TransactionRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.TreeMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class VNPayIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private RentalOrderRepository rentalOrderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private TransactionTemplate txTemplate;

    private Transaction pendingTx;
    private RentalOrder order;

    @BeforeEach
    void setUp() {
        txTemplate.executeWithoutResult(status -> {
            transactionRepository.deleteAll();
            rentalOrderRepository.deleteAll();

            Customer customer = customerRepository.findAll().stream().findFirst().orElseGet(() -> {
                Customer c = new Customer();
                c.setEmail("renter@test.com");
                c.setPasswordHash("pass");
                c.setFullName("Renter");
                c.setPhone("0987654321");
                c.setRole(Role.CUSTOMER);
                c.setStatus(CustomerStatus.ACTIVE);
                c.setCreatedAt(LocalDateTime.now());
                c.setUpdatedAt(LocalDateTime.now());
                return customerRepository.save(c);
            });

            Car car = em.createQuery("select c from Car c", Car.class).setMaxResults(1).getResultList()
                    .stream().findFirst().orElseGet(() -> {
                        Car c = new Car();
                        c.setOwner(customer);
                        c.setBrand("Toyota");
                        c.setModel("Vios");
                        c.setManufactureYear(2023);
                        c.setLicensePlate("30A-99999");
                        c.setCarType(CarType.SEDAN);
                        c.setSeats(5);
                        c.setFuelType(FuelType.GASOLINE);
                        c.setTransmission(Transmission.AUTOMATIC);
                        c.setPricePerHour(BigDecimal.valueOf(100_000));
                        c.setPricePerDay(BigDecimal.valueOf(800_000));
                        c.setStatus(CarStatus.ACTIVE);
                        c.setCity("Hà Nội");
                        c.setPickupAddress("Hà Nội");
                        c.setCreatedAt(LocalDateTime.now());
                        c.setUpdatedAt(LocalDateTime.now());
                        em.persist(c);
                        return c;
                    });

            CarSlot slot = CarSlot.builder().car(car)
                    .startTime(LocalDateTime.now().minusDays(1))
                    .endTime(LocalDateTime.now().plusDays(10))
                    .pricePerHour(BigDecimal.valueOf(100_000))
                    .pricePerDay(BigDecimal.valueOf(800_000))
                    .rentalOption(RentalOption.BOTH)
                    .minRentalHours(4)
                    .status(SlotStatus.OPEN)
                    .build();
            em.persist(slot);

            order = new RentalOrder();
            order.setCustomer(customer);
            order.setCar(car);
            order.setCarSlot(slot);
            order.setOrderCode("ORD-TEST-" + System.nanoTime());
            order.setStartTime(LocalDateTime.now().plusDays(1));
            order.setEndTime(LocalDateTime.now().plusDays(2));
            order.setStatus(OrderStatus.CONFIRMED);
            order.setPaymentStatus(PaymentStatus.UNPAID);
            order.setRentalType(RentalType.DAILY);
            order.setQuantity(1);
            order.setUnitPrice(BigDecimal.valueOf(800_000));
            order.setRentalAmount(BigDecimal.valueOf(800_000));
            order.setTotalAmount(BigDecimal.valueOf(800_000));
            order.setDepositAmount(BigDecimal.valueOf(2_000_000));
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            order = rentalOrderRepository.save(order);

            pendingTx = new Transaction();
            pendingTx.setOrder(order);
            pendingTx.setAmount(BigDecimal.valueOf(800_000));
            pendingTx.setMethod(PaymentMethod.VNPAY);
            pendingTx.setStatus(TransactionStatus.PENDING);
            pendingTx.setTransactionType(TransactionType.RENTAL_PAYMENT);
            pendingTx.setCreatedAt(LocalDateTime.now());
            pendingTx.setUpdatedAt(LocalDateTime.now());
            pendingTx = transactionRepository.save(pendingTx);
        });
    }

    private String calculateSecureHash(Map<String, String> params) {
        Map<String, String> fields = new TreeMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");
        return vnPayConfig.hashAllFields(fields);
    }

    @Test
    void vnpayReturn_rejectsMissingSecureHash() throws Exception {
        mockMvc.perform(get("/api/transactions/vnpay-return")
                        .param("vnp_TxnRef", pendingTx.getId() + "_123456")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_Amount", "80000000")
                        .header("Accept", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Thiếu chữ ký bảo mật vnp_SecureHash"));

        Transaction tx = transactionRepository.findById(pendingTx.getId()).orElseThrow();
        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.PENDING);
    }

    @Test
    void vnpayReturn_rejectsInvalidSecureHash() throws Exception {
        mockMvc.perform(get("/api/transactions/vnpay-return")
                        .param("vnp_TxnRef", pendingTx.getId() + "_123456")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_Amount", "80000000")
                        .param("vnp_SecureHash", "INVALID_HASH_123456")
                        .header("Accept", MediaType.APPLICATION_JSON_VALUE))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Chữ ký bảo mật VNPay không hợp lệ"));

        Transaction tx = transactionRepository.findById(pendingTx.getId()).orElseThrow();
        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.PENDING);
    }

    @Test
    void vnpayReturn_succeedsWithoutAcceptHeader() throws Exception {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_TxnRef", pendingTx.getId() + "_123456");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "14567890");
        params.put("vnp_Amount", "80000000");
        String hash = calculateSecureHash(params);

        // Request WITHOUT Accept header: must return 200 OK (HTML), NOT 500 error!
        mockMvc.perform(get("/api/transactions/vnpay-return")
                        .param("vnp_TxnRef", params.get("vnp_TxnRef"))
                        .param("vnp_ResponseCode", params.get("vnp_ResponseCode"))
                        .param("vnp_TransactionNo", params.get("vnp_TransactionNo"))
                        .param("vnp_Amount", params.get("vnp_Amount"))
                        .param("vnp_SecureHash", hash))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML));

        Transaction tx = transactionRepository.findById(pendingTx.getId()).orElseThrow();
        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.SUCCESS);

        RentalOrder updatedOrder = rentalOrderRepository.findById(order.getId()).orElseThrow();
        assertThat(updatedOrder.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    void vnpayReturn_returnsJsonWhenFormatJson() throws Exception {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_TxnRef", pendingTx.getId() + "_123456");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "14567890");
        params.put("vnp_Amount", "80000000");
        String hash = calculateSecureHash(params);

        mockMvc.perform(get("/api/transactions/vnpay-return")
                        .param("vnp_TxnRef", params.get("vnp_TxnRef"))
                        .param("vnp_ResponseCode", params.get("vnp_ResponseCode"))
                        .param("vnp_TransactionNo", params.get("vnp_TransactionNo"))
                        .param("vnp_Amount", params.get("vnp_Amount"))
                        .param("vnp_SecureHash", hash)
                        .param("format", "json"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));
    }

    @Test
    void vnpayIpn_returns97WhenChecksumInvalid() throws Exception {
        mockMvc.perform(get("/api/transactions/vnpay-ipn")
                        .param("vnp_TxnRef", pendingTx.getId() + "_123456")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_Amount", "80000000")
                        .param("vnp_SecureHash", "BAD_HASH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Invalid Checksum"));
    }
}
