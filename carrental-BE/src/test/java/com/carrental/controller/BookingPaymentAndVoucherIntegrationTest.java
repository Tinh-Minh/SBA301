package com.carrental.controller;

import com.carrental.TestJwtKeys;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.entity.Transaction;
import com.carrental.entity.Voucher;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.FuelType;
import com.carrental.enums.KycStatus;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.Role;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.enums.Transmission;
import com.carrental.enums.VoucherStatus;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.support.MutableClock;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class BookingPaymentAndVoucherIntegrationTest {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    @TestConfiguration
    static class ClockConfig {
        @Bean
        @Primary
        MutableClock testClock() {
            return new MutableClock(LocalDateTime.now(VN), VN);
        }
    }

    @DynamicPropertySource
    static void securityProperties(DynamicPropertyRegistry properties) {
        properties.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        properties.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        properties.add("app.security.jwt.access-token-ttl", () -> "PT30M");
        properties.add("app.security.jwt.clock-skew", () -> "PT30S");
        properties.add("app.payment.simulate-gateway-enabled", () -> "true");
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private CarRepository carRepository;
    @Autowired private BookingRepository bookingRepository;
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private MutableClock clock;
    @Autowired private EntityManager entityManager;
    @Autowired private TransactionTemplate tx;

    private LocalDateTime now;
    private Long ownerId;
    private Long customerId;
    private Long otherCustomerId;
    private Long carId;
    private Long voucher10Id;
    private Long voucherFixedId;
    private Long expiredVoucherId;
    private Long exhaustedVoucherId;

    @BeforeEach
    void seed() {
        now = LocalDateTime.now(VN).withNano(0);
        clock.setTo(now);
        tx.executeWithoutResult(s -> {
            for (String entity : List.of("HandoverItem", "Handover", "Transaction", "Booking", "CarSafetyRecord",
                    "Review", "CarSubscription", "CarImage", "CarDocument", "Car", "ListingPackage", "Voucher", "Customer")) {
                entityManager.createQuery("delete from " + entity).executeUpdate();
            }
            Customer owner = persist(customer("Chủ Xe", "owner@test.vn", "0900000001", Role.OWNER));
            Customer cust = persist(customer("Khách Thuê", "customer@test.vn", "0900000002", Role.CUSTOMER));
            Customer other = persist(customer("Khách Khác", "other@test.vn", "0900000003", Role.CUSTOMER));
            ownerId = owner.getId();
            customerId = cust.getId();
            otherCustomerId = other.getId();

            Car c = persist(car(owner, "51A-99999", CarStatus.ACTIVE));
            carId = c.getId();

            voucher10Id = persist(voucher("GIAM10", DiscountType.PERCENT, "10", "50000", "100000", 100, 1)).getId();
            voucherFixedId = persist(voucher("FIXED50K", DiscountType.FIXED, "50000", "50000", "100000", 50, 1)).getId();

            Voucher exp = voucher("EXPIRED", DiscountType.PERCENT, "10", null, "10000", 10, 1);
            exp.setStartAt(now.minusDays(10));
            exp.setEndAt(now.minusDays(1));
            expiredVoucherId = persist(exp).getId();

            Voucher exh = voucher("EXHAUSTED", DiscountType.FIXED, "20000", null, "10000", 1, 1);
            exh.setUsedCount(1);
            exhaustedVoucherId = persist(exh).getId();
        });
    }

    // =========================================================================
    // 1. VOUCHER KHI ĐẶT XE (HAPPY & UNHAPPY CASES)
    // =========================================================================

    @Test
    @DisplayName("Đặt xe thành công kèm mã voucher hợp lệ: tính đúng giảm giá và lưu vào đơn")
    void createBookingWithValidVoucher() throws Exception {
        LocalDateTime pickup = now.plusDays(1).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2); // 2 ngày * 800.000 = 1.600.000
        // Giảm 10% tối đa 50.000đ -> discount = 50.000đ

        String body = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "contactPhone": "0900000002",
                "customerNote": "Cần xe sạch sẽ",
                "voucherCode": "GIAM10"
            }
        """.formatted(carId, pickup, dropoff);

        ResultActions result = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.voucherCode").value("GIAM10"))
                .andExpect(jsonPath("$.data.discountAmount").value(50000))
                .andExpect(jsonPath("$.data.depositStatus").value("UNPAID"));

        Long bookingId = Long.valueOf(JsonPath.read(result.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        Booking booking = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(booking.getVoucher()).isNotNull();
        assertThat(booking.getVoucher().getId()).isEqualTo(voucher10Id);
        assertThat(booking.getDiscountAmount()).isEqualByComparingTo("50000");

        // Voucher usedCount tăng lên 1
        Voucher v = voucherRepository.findById(voucher10Id).orElseThrow();
        assertThat(v.getUsedCount()).isEqualTo(1);
    }

    @Test
    @DisplayName("Đặt xe với mã voucher hết hạn: từ chối 400 kèm thông báo rõ")
    void createBookingWithExpiredVoucher() throws Exception {
        LocalDateTime pickup = now.plusDays(1).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        String body = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "EXPIRED"
            }
        """.formatted(carId, pickup, dropoff);

        as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Voucher đã hết hạn hoặc chưa đến thời gian sử dụng"));
    }

    @Test
    @DisplayName("Đặt xe với mã voucher hết lượt: từ chối 400 kèm thông báo rõ")
    void createBookingWithExhaustedVoucher() throws Exception {
        LocalDateTime pickup = now.plusDays(1).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        String body = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "EXHAUSTED"
            }
        """.formatted(carId, pickup, dropoff);

        as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Voucher đã hết lượt sử dụng"));
    }

    @Test
    @DisplayName("Đặt xe với mã voucher sai / không tồn tại: từ chối 400")
    void createBookingWithInvalidVoucherCode() throws Exception {
        LocalDateTime pickup = now.plusDays(1).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        String body = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "NOT_EXIST_CODE"
            }
        """.formatted(carId, pickup, dropoff);

        as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Mã voucher không tồn tại"));
    }

    @Test
    @DisplayName("Đặt xe với voucher không đủ điều kiện minOrderAmount: từ chối 400")
    void createBookingVoucherMinOrderAmountNotMet() throws Exception {
        // Tạo voucher với minOrderAmount = 10.000.000đ
        persist(voucher("HIGHMIN", DiscountType.FIXED, "100000", null, "10000000", 100, 1));

        LocalDateTime pickup = now.plusDays(1).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(1); // 1 ngày = 800.000 < 10.000.000

        String body = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "HIGHMIN"
            }
        """.formatted(carId, pickup, dropoff);

        as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("Đơn thuê chưa đạt giá trị tối thiểu")));
    }

    @Test
    @DisplayName("Đặt xe khi đã dùng hết lượt voucher perUserLimit: từ chối 400")
    void createBookingExceededPerUserLimit() throws Exception {
        LocalDateTime p1 = now.plusDays(1).withHour(8).withMinute(0);
        LocalDateTime d1 = p1.plusDays(2);

        String b1 = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "FIXED50K"
            }
        """.formatted(carId, p1, d1);

        as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(b1))
                .andExpect(status().isOk());

        LocalDateTime p2 = now.plusDays(4).withHour(8).withMinute(0);
        LocalDateTime d2 = p2.plusDays(2);
        String b2 = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "FIXED50K"
            }
        """.formatted(carId, p2, d2);

        as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(b2))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Bạn đã dùng hết lượt của voucher này"));
    }

    // =========================================================================
    // 2. THANH TOÁN TIỀN CỌC QUA VNPAY & SIMULATE GATEWAY
    // =========================================================================

    @Test
    @DisplayName("Chủ xe nhận đơn (CONFIRMED) -> Khách thanh toán tiền cọc qua VNPay -> Thành công")
    void fullDepositPaymentFlowSuccess() throws Exception {
        LocalDateTime pickup = now.plusDays(2).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        // 1. Khách đặt xe
        String createBody = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "GIAM10"
            }
        """.formatted(carId, pickup, dropoff);
        ResultActions res = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk());
        Long bookingId = Long.valueOf(JsonPath.read(res.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        // 2. Cố tình thanh toán cọc khi chưa được duyệt (REQUESTED) -> từ chối 400
        String depositBody = """
            {
                "bookingId": %d,
                "method": "VNPAY"
            }
        """.formatted(bookingId);
        as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Chỉ có thể đặt cọc khi đơn thuê đã được chủ xe xác nhận (CONFIRMED)"));

        // 3. Chủ xe liên hệ & nhận đơn -> chuyển sang CONFIRMED
        as(ownerId, post("/api/bookings/" + bookingId + "/contacted")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contacted\": true, \"contactNote\": \"Đã gọi điện chốt giờ\"}"))
                .andExpect(status().isOk());
        as(ownerId, post("/api/bookings/" + bookingId + "/accept"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));

        // 4. Người khác (không phải khách thuê) cố tình thanh toán đơn này -> từ chối 403 Forbidden
        as(otherCustomerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Chỉ khách thuê xe mới được thực hiện thanh toán tiền cọc cho đơn này"));

        // 5. Khách thuê thanh toán tiền cọc -> Tạo Transaction PENDING
        ResultActions txRes = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.transactionType").value("BOOKING_DEPOSIT"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.amount").value(2000000)) // Tiền cọc xe là 2.000.000đ
                .andExpect(jsonPath("$.data.bookingId").value(bookingId));

        Long txId = Long.valueOf(JsonPath.read(txRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        // 6. Giả lập cổng thanh toán thành công (simulateGateway)
        as(customerId, post("/api/transactions/" + txId + "/simulate-gateway")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"simulateSuccess\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.providerRef").isNotEmpty());

        // 7. Kiểm tra trạng thái đơn: depositStatus đã chuyển sang PAID!
        Booking b = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(b.getDepositStatus()).isEqualTo(PaymentStatus.PAID);

        // 8. Cố tình thanh toán cọc lần nữa khi đã PAID -> từ chối 400
        as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Đơn thuê này đã được thanh toán tiền cọc"));

        // 9. Callback lặp lại (idempotent): simulate lần nữa không làm hỏng dữ liệu
        as(customerId, post("/api/transactions/" + txId + "/simulate-gateway")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"simulateSuccess\": true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("SUCCESS"));
    }

    @Test
    @DisplayName("Thanh toán tiền cọc thất bại: giao dịch chuyển FAILED, đơn không bị kẹt và có thể thanh toán lại")
    void depositPaymentFailureAndRetry() throws Exception {
        LocalDateTime pickup = now.plusDays(2).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        String createBody = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s"
            }
        """.formatted(carId, pickup, dropoff);
        ResultActions res = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk());
        Long bookingId = Long.valueOf(JsonPath.read(res.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        // Chủ xe accept
        as(ownerId, post("/api/bookings/" + bookingId + "/contacted")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contacted\": true, \"contactNote\": \"Đã gọi điện\"}"));
        as(ownerId, post("/api/bookings/" + bookingId + "/accept"));

        // Khách khởi tạo thanh toán cọc
        String depositBody = "{\"bookingId\": " + bookingId + ", \"method\": \"VNPAY\"}";
        ResultActions txRes = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk());
        Long txId = Long.valueOf(JsonPath.read(txRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        // Giả lập thanh toán THẤT BẠI
        as(customerId, post("/api/transactions/" + txId + "/simulate-gateway")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"simulateSuccess\": false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("FAILED"));

        // Đơn không bị kẹt: trạng thái vẫn là CONFIRMED, depositStatus vẫn là UNPAID
        Booking b = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(b.getDepositStatus()).isEqualTo(PaymentStatus.UNPAID);

        // Khách thanh toán lại (retry): tạo giao dịch mới thành công
        ResultActions retryRes = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PENDING"));
        Long retryTxId = Long.valueOf(JsonPath.read(retryRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        // Giả lập lần này thành công
        as(customerId, post("/api/transactions/" + retryTxId + "/simulate-gateway")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"simulateSuccess\": true}"))
                .andExpect(status().isOk());

        b = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(b.getDepositStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    @DisplayName("Hủy đơn thuê trước khi thanh toán cọc: hoàn lại lượt dùng voucher")
    void cancelBookingBeforeDepositRefundsVoucher() throws Exception {
        LocalDateTime pickup = now.plusDays(2).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        String createBody = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "FIXED50K"
            }
        """.formatted(carId, pickup, dropoff);
        ResultActions res = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk());
        Long bookingId = Long.valueOf(JsonPath.read(res.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        Voucher v = voucherRepository.findById(voucherFixedId).orElseThrow();
        assertThat(v.getUsedCount()).isEqualTo(1);

        // Khách hủy đơn
        as(customerId, post("/api/bookings/" + bookingId + "/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\": \"Tôi đổi kế hoạch đi công tác\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));

        // Voucher usedCount được giảm lại về 0
        v = voucherRepository.findById(voucherFixedId).orElseThrow();
        assertThat(v.getUsedCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Hủy đơn thuê ĐÃ ĐẶT CỌC: hoàn cọc rõ ràng và ghi nhận trong Transaction (BOOKING_REFUND)")
    void cancelPaidBookingTriggersDepositRefundTransaction() throws Exception {
        // Đặt trước 3 ngày (> 24h)
        LocalDateTime pickup = now.plusDays(3).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);

        String createBody = """
            {
                "carId": %d,
                "pickupAt": "%s",
                "returnAt": "%s",
                "voucherCode": "GIAM10"
            }
        """.formatted(carId, pickup, dropoff);
        ResultActions res = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk());
        Long bookingId = Long.valueOf(JsonPath.read(res.andReturn().getResponse().getContentAsString(), "$.data.id").toString());

        // Chủ xe accept
        as(ownerId, post("/api/bookings/" + bookingId + "/contacted")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"contacted\": true, \"contactNote\": \"Đã gọi điện\"}"));
        as(ownerId, post("/api/bookings/" + bookingId + "/accept"));

        // Khách cọc tiền
        String depositBody = "{\"bookingId\": " + bookingId + ", \"method\": \"VNPAY\"}";
        ResultActions txRes = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk());
        Long txId = Long.valueOf(JsonPath.read(txRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        as(customerId, post("/api/transactions/" + txId + "/simulate-gateway")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"simulateSuccess\": true}"));

        Booking b = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(b.getDepositStatus()).isEqualTo(PaymentStatus.PAID);

        // Khách hủy đơn trước 24h
        as(customerId, post("/api/bookings/" + bookingId + "/cancel")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"reason\": \"Có việc bận đột xuất\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.depositStatus").value("REFUNDED"));

        // Kiểm tra Transaction hoàn cọc được ghi nhận
        List<Transaction> txs = transactionRepository.findAllByBookingIdOrderByCreatedAtDesc(bookingId);
        assertThat(txs).hasSize(2);
        Transaction refundTx = txs.stream().filter(t -> t.getTransactionType() == TransactionType.BOOKING_REFUND).findFirst().orElseThrow();
        assertThat(refundTx.getStatus()).isEqualTo(TransactionStatus.SUCCESS);
        assertThat(refundTx.getAmount()).isEqualByComparingTo("2000000"); // 100% hoàn lại 2.000.000đ
        assertThat(refundTx.getProviderRef()).startsWith("REFUND_BK_");

        // Lượt voucher cũng được hoàn trả
        Voucher v = voucherRepository.findById(voucher10Id).orElseThrow();
        assertThat(v.getUsedCount()).isEqualTo(0);
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private ResultActions as(Long userId, MockHttpServletRequestBuilder requestBuilder) throws Exception {
        Customer c = customerRepository.findById(userId).orElseThrow();
        CurrentAccount principal = new CurrentAccount(c.getId(), c.getRole());
        var auth = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                List.of(new SimpleGrantedAuthority("ROLE_" + c.getRole().name()))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        return mockMvc.perform(requestBuilder.principal(auth));
    }

    private <T> T persist(T entity) {
        return tx.execute(s -> {
            entityManager.persist(entity);
            entityManager.flush();
            return entity;
        });
    }

    private Customer customer(String name, String email, String phone, Role role) {
        return Customer.builder()
                .fullName(name)
                .email(email)
                .phone(phone)
                .role(role)
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.VERIFIED)
                .passwordHash("$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF")
                .build();
    }

    private Car car(Customer owner, String plate, CarStatus status) {
        return Car.builder()
                .owner(owner)
                .brand("Toyota")
                .model("Vios")
                .manufactureYear(2023)
                .licensePlate(plate)
                .carType(CarType.SEDAN)
                .seats(5)
                .transmission(Transmission.AUTOMATIC)
                .fuelType(FuelType.GASOLINE)
                .rentalPricePerDay(BigDecimal.valueOf(800000))
                .depositAmount(BigDecimal.valueOf(2000000))
                .city("Hồ Chí Minh")
                .pickupAddress("123 Lê Lợi, Q1")
                .status(status)
                .listingStatus(ListingStatus.LISTED)
                .build();
    }

    private Voucher voucher(String code, DiscountType type, String val, String maxDisc, String minOrder, int limit, int perUser) {
        return Voucher.builder()
                .code(code)
                .description("Voucher test " + code)
                .discountType(type)
                .discountValue(new BigDecimal(val))
                .maxDiscount(maxDisc == null ? null : new BigDecimal(maxDisc))
                .minOrderAmount(new BigDecimal(minOrder))
                .startAt(now.minusDays(5))
                .endAt(now.plusDays(30))
                .usageLimit(limit)
                .perUserLimit(perUser)
                .usedCount(0)
                .status(VoucherStatus.ACTIVE)
                .build();
    }
}
