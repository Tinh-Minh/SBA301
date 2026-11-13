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
                    "Review", "CarSubscription", "CarImage", "CarDocument", "Car", "ListingPackage", "Voucher", "UserDocument", "Customer")) {
                entityManager.createQuery("delete from " + entity).executeUpdate();
            }
            Customer owner = persist(customer("Chủ Xe", "owner@test.vn", "0900000001", Role.OWNER));
            Customer cust = persist(customer("Khách Thuê", "customer@test.vn", "0900000002", Role.CUSTOMER));
            Customer other = persist(customer("Khách Khác", "other@test.vn", "0900000003", Role.CUSTOMER));
            persist(driverLicense(cust, "GPLX-0002"));
            persist(driverLicense(other, "GPLX-0003"));
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

        // VR-02: lượt voucher chỉ bị trừ khi chủ xe xác nhận đơn, lúc gửi yêu cầu chưa trừ
        Voucher v = voucherRepository.findById(voucher10Id).orElseThrow();
        assertThat(v.getUsedCount()).isEqualTo(0);
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

    @Autowired private com.carrental.config.VNPayConfig vnPayConfig;

    /** Mô phỏng VNPay chuyển hướng về (return URL) với chữ ký HMAC hợp lệ. */
    private void vnpayReturn(Long txId, long amount, boolean success) throws Exception {
        java.util.Map<String, String> p = new java.util.TreeMap<>();
        p.put("vnp_TxnRef", txId + "_" + System.nanoTime());
        p.put("vnp_Amount", String.valueOf(amount * 100));
        p.put("vnp_ResponseCode", success ? "00" : "24");
        p.put("vnp_TransactionStatus", success ? "00" : "02");
        p.put("vnp_TransactionNo", "TEST" + txId);
        String hash = vnPayConfig.hashAllFields(p);
        var req = get("/api/payments/vnpay/return").param("format", "json").param("vnp_SecureHash", hash);
        p.forEach(req::param);
        mockMvc.perform(req).andExpect(status().isOk());
    }

    private long depositOf(long payable) {
        return Math.min(payable, (long) Math.ceil(payable * 0.4 / 1000.0) * 1000);
    }

    @Test
    @DisplayName("Luồng tiền đầy đủ: cọc 40% ngay khi đặt -> chủ xe xác nhận -> trả đủ trước khi nhận xe")
    void fullDepositPaymentFlowSuccess() throws Exception {
        LocalDateTime pickup = now.plusDays(2).withHour(8).withMinute(0);
        LocalDateTime dropoff = pickup.plusDays(2);
        String createBody = """
            {"carId": %d, "pickupAt": "%s", "returnAt": "%s", "voucherCode": "GIAM10"}
        """.formatted(carId, pickup, dropoff);
        ResultActions res = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REQUESTED"))
                .andExpect(jsonPath("$.data.depositStatus").value("UNPAID"));
        Long bookingId = Long.valueOf(JsonPath.read(res.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        Booking created = bookingRepository.findById(bookingId).orElseThrow();
        long payable = created.getRentalAmount().subtract(created.getDiscountAmount()).longValue();
        long deposit = depositOf(payable);
        assertThat(created.getDepositAmount().longValue()).isEqualTo(deposit);

        // Chủ xe không được xác nhận khi khách chưa cọc
        as(ownerId, post("/api/bookings/" + bookingId + "/contacted").contentType(MediaType.APPLICATION_JSON)
                .content("{\"contacted\": true, \"contactNote\": \"Đã gọi điện chốt giờ\"}")).andExpect(status().isOk());
        as(ownerId, post("/api/bookings/" + bookingId + "/accept")).andExpect(status().isConflict());

        // Người khác không thanh toán hộ được
        String depositBody = "{\"bookingId\": " + bookingId + ", \"method\": \"VNPAY\"}";
        as(otherCustomerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isForbidden());

        // Khách cọc 40% ngay khi đặt
        ResultActions txRes = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.transactionType").value("BOOKING_DEPOSIT"))
                .andExpect(jsonPath("$.data.amount").value(deposit));
        Long txId = Long.valueOf(JsonPath.read(txRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        vnpayReturn(txId, deposit, true);
        Booking b = bookingRepository.findById(bookingId).orElseThrow();
        assertThat(b.getDepositStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(b.getDepositPaidAt()).isNotNull();

        // Không cọc lần hai; callback lặp lại không làm hỏng dữ liệu
        as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isBadRequest());
        vnpayReturn(txId, deposit, true);

        // Chủ xe xác nhận; khách thanh toán phần còn lại trước khi nhận xe
        as(ownerId, post("/api/bookings/" + bookingId + "/accept")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));
        Booking confirmed = bookingRepository.findById(bookingId).orElseThrow();
        long remaining = confirmed.getRentalAmount().subtract(confirmed.getDiscountAmount()).longValue() - deposit;
        ResultActions rentRes = as(customerId, post("/api/bookings/" + bookingId + "/rental-payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.transactionType").value("BOOKING_PAYMENT"))
                .andExpect(jsonPath("$.data.amount").value(remaining));
        Long rentTx = Long.valueOf(JsonPath.read(rentRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        vnpayReturn(rentTx, remaining, true);
        assertThat(bookingRepository.findById(bookingId).orElseThrow().getRentalPaymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    @DisplayName("Thanh toán cọc thất bại: giao dịch FAILED, đơn vẫn chờ cọc và thanh toán lại được")
    void depositPaymentFailureAndRetry() throws Exception {
        LocalDateTime pickup = now.plusDays(2).withHour(8).withMinute(0);
        String createBody = """
            {"carId": %d, "pickupAt": "%s", "returnAt": "%s"}
        """.formatted(carId, pickup, pickup.plusDays(2));
        ResultActions res = as(customerId, post("/api/bookings").contentType(MediaType.APPLICATION_JSON).content(createBody))
                .andExpect(status().isOk());
        Long bookingId = Long.valueOf(JsonPath.read(res.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        long deposit = bookingRepository.findById(bookingId).orElseThrow().getDepositAmount().longValue();

        String depositBody = "{\"bookingId\": " + bookingId + ", \"method\": \"VNPAY\"}";
        ResultActions txRes = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk());
        Long txId = Long.valueOf(JsonPath.read(txRes.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        vnpayReturn(txId, deposit, false);
        assertThat(transactionRepository.findById(txId).orElseThrow().getStatus()).isEqualTo(TransactionStatus.FAILED);
        assertThat(bookingRepository.findById(bookingId).orElseThrow().getDepositStatus()).isEqualTo(PaymentStatus.UNPAID);

        // Thanh toán lại thành công
        ResultActions retry = as(customerId, post("/api/transactions/booking-deposit").contentType(MediaType.APPLICATION_JSON).content(depositBody))
                .andExpect(status().isOk());
        Long retryId = Long.valueOf(JsonPath.read(retry.andReturn().getResponse().getContentAsString(), "$.data.id").toString());
        assertThat(retryId).isNotEqualTo(txId);
        vnpayReturn(retryId, deposit, true);
        assertThat(bookingRepository.findById(bookingId).orElseThrow().getDepositStatus()).isEqualTo(PaymentStatus.PAID);
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
        assertThat(v.getUsedCount()).isEqualTo(0); // VR-02: chưa trừ lượt khi mới gửi yêu cầu

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

    /** BK-01: người thuê phải có GPLX đã duyệt, còn hạn. */
    private com.carrental.entity.UserDocument driverLicense(Customer owner, String number) {
        com.carrental.entity.UserDocument doc = new com.carrental.entity.UserDocument();
        doc.setCustomer(owner);
        doc.setDocType(com.carrental.enums.DocumentType.DRIVER_LICENSE);
        doc.setDocNumber(number);
        doc.setLicenseClass("B2");
        doc.setExpiresAt(java.time.LocalDate.of(2099, 1, 1));
        doc.setFrontImageUrl("private-local:front.png");
        doc.setVerifyStatus(com.carrental.enums.VerificationStatus.APPROVED);
        return doc;
    }

    private Customer customer(String name, String email, String phone, Role role) {
        return Customer.builder()
                .fullName(name)
                .email(email)
                .phone(phone)
                .role(role)
                .status(CustomerStatus.ACTIVE)
                .kycStatus(KycStatus.VERIFIED)
                .bankAccountNumber("0071000123456").bankName("Vietcombank")
                .bankBranch("Chi nhánh Tân Định").bankAccountHolder(name.toUpperCase())
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
