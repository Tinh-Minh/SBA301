package com.carrental.controller;

import com.carrental.TestJwtKeys;
import com.carrental.entity.Car;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Customer;
import com.carrental.entity.ListingPackage;
import com.carrental.entity.Transaction;
import com.carrental.entity.Voucher;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.FuelType;
import com.carrental.enums.KycStatus;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.Role;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.enums.Transmission;
import com.carrental.enums.VoucherStatus;
import com.carrental.event.PaymentCompletedEvent;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.CarSubscriptionService;
import com.carrental.support.MutableClock;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ApplicationEventPublisher;
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
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test hồi quy cho các lỗi trong báo cáo kiểm thử nhánh car-slot (F2-01, F4-01, ...).
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class BugFixRegressionIntegrationTest {

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
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private CarRepository carRepository;
    @Autowired private CarSubscriptionRepository subscriptionRepository;
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private CarSubscriptionService subscriptionService;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private com.carrental.service.impl.TransactionServiceImpl transactionServiceImpl;
    @Autowired private MutableClock clock;
    @Autowired private EntityManager entityManager;
    @Autowired private TransactionTemplate tx;

    private LocalDateTime now;
    private Long ownerId;
    private Long otherId;
    private Long plainCustomerId;
    private Long adminId;
    private Long carId;
    private Long pendingApprovalCarId;
    private Long rejectedCarId;
    private Long packageId;
    private Long voucherId;

    @BeforeEach
    void seed() {
        now = LocalDateTime.now(VN);
        clock.setTo(now);
        tx.executeWithoutResult(s -> {
            for (String entity : List.of("Transaction", "Review", "CarSubscription", "CarImage", "CarDocument", "Car",
                    "ListingPackage", "Voucher", "Customer")) {
                entityManager.createQuery("delete from " + entity).executeUpdate();
            }
            Customer owner = persist(customer("Chủ Xe", "owner@bug.vn", "0940000001", Role.OWNER));
            otherId = persist(customer("Chủ Khác", "other@bug.vn", "0940000002", Role.OWNER)).getId();
            plainCustomerId = persist(customer("Khách Hàng", "customer@bug.vn", "0940000004", Role.CUSTOMER)).getId();
            adminId = persist(customer("Admin", "admin@bug.vn", "0940000003", Role.ADMIN)).getId();
            ownerId = owner.getId();
            carId = persist(car(owner, "51A-11111", CarStatus.ACTIVE)).getId();
            pendingApprovalCarId = persist(car(owner, "51A-22222", CarStatus.PENDING_APPROVAL)).getId();
            rejectedCarId = persist(car(owner, "51A-33333", CarStatus.REJECTED)).getId();
            packageId = persist(listingPackage("PKG_STANDARD", 30, true)).getId();
            voucherId = persist(voucher("GIAM10", DiscountType.PERCENT, "10", "10000")).getId();
        });
    }

    // ===================================================================== F2-01

    @Test
    void ownerCannotSelfApprovePendingOrRejectedCar() throws Exception {
        as(ownerId, patch("/api/cars/" + pendingApprovalCarId + "/status").param("status", "ACTIVE"))
                .andExpect(status().isConflict());
        as(ownerId, patch("/api/cars/" + rejectedCarId + "/status").param("status", "ACTIVE"))
                .andExpect(status().isConflict());
        assertThat(carRepository.findById(pendingApprovalCarId).orElseThrow().getStatus())
                .isEqualTo(CarStatus.PENDING_APPROVAL);
        assertThat(carRepository.findById(rejectedCarId).orElseThrow().getStatus()).isEqualTo(CarStatus.REJECTED);
        // Xe chưa duyệt vẫn không mua được gói (F3-01)
        as(ownerId, post("/api/subscriptions").content(json(pendingApprovalCarId, packageId, null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void ownerCanStillPauseAndResumeApprovedCar() throws Exception {
        as(ownerId, patch("/api/cars/" + carId + "/status").param("status", "INACTIVE")).andExpect(status().isOk());
        as(ownerId, patch("/api/cars/" + carId + "/status").param("status", "ACTIVE")).andExpect(status().isOk());
        assertThat(car().getStatus()).isEqualTo(CarStatus.ACTIVE);
    }

    // ===================================================================== F4-01

    @Test
    void simulateGatewayHonoursFailureFlagAndKeepsListingHidden() throws Exception {
        Long subId = create(null);
        Long txId = pendingTransaction(subId);
        as(ownerId, post("/api/transactions/" + txId + "/simulate-gateway").content("{\"simulateSuccess\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("FAILED"));
        assertThat(subscription(subId).getStatus()).isEqualTo(SubscriptionStatus.PENDING_PAYMENT);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.UNLISTED);
        // Giao dịch đã FAILED thì không giả lập lại thành SUCCESS được
        as(ownerId, post("/api/transactions/" + txId + "/simulate-gateway")).andExpect(status().isBadRequest());
    }

    @Test
    void simulateGatewayIsRejectedWhenDisabled() throws Exception {
        Long subId = create(null);
        Long txId = pendingTransaction(subId);
        transactionServiceImpl.setSimulateGatewayEnabled(false);
        try {
            as(ownerId, post("/api/transactions/" + txId + "/simulate-gateway")).andExpect(status().isForbidden());
            as(adminId, post("/api/transactions/" + txId + "/simulate-gateway")).andExpect(status().isForbidden());
        } finally {
            transactionServiceImpl.setSimulateGatewayEnabled(true);
        }
        assertThat(subscription(subId).getStatus()).isEqualTo(SubscriptionStatus.PENDING_PAYMENT);
    }

    private Long pendingTransaction(Long subId) throws Exception {
        String body = as(ownerId, post("/api/transactions/package-payment")
                .content("{\"subscriptionId\":" + subId + ",\"method\":\"VNPAY\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.data.id")).longValue();
    }

    // ===================================================================== F2-02

    @Test
    void publicSearchNeverExposesUnlistedCars() throws Exception {
        // carId đang ACTIVE nhưng UNLISTED (chưa mua gói)
        mockMvc.perform(get("/api/cars/search").param("listingStatus", "UNLISTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(0));
        mockMvc.perform(get("/api/cars/search"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content.length()").value(0));
    }

    // ===================================================================== F2-03

    @Test
    void duplicatePlateIsDetectedRegardlessOfFormatting() throws Exception {
        as(ownerId, post("/api/cars").content(carJson("51A11111"))).andExpect(status().isConflict());
        as(ownerId, post("/api/cars").content(carJson("51a 111.11"))).andExpect(status().isConflict());
        as(otherId, post("/api/cars").content(carJson("51A-111.11"))).andExpect(status().isConflict());
        as(ownerId, post("/api/cars").content(carJson("60B-123.45"))).andExpect(status().isOk());
        as(ownerId, post("/api/cars").content(carJson("60B12345"))).andExpect(status().isConflict());
    }

    private static String carJson(String plate) {
        return "{\"licensePlate\":\"" + plate + "\",\"brand\":\"Toyota\",\"model\":\"Vios\",\"manufactureYear\":2022,"
                + "\"carType\":\"SEDAN\",\"seats\":5,\"transmission\":\"AUTOMATIC\",\"fuelType\":\"GASOLINE\","
                + "\"city\":\"Hồ Chí Minh\",\"pickupAddress\":\"1 Lê Lợi\",\"rentalPricePerDay\":800000}";
    }

    // ===================================================================== F2-04

    @Test
    void adminCannotApproveCarWithoutVerifiedRegistration() throws Exception {
        as(adminId, post("/api/admin/cars/" + pendingApprovalCarId + "/approve")).andExpect(status().isConflict());

        String doc = as(ownerId, post("/api/cars/" + pendingApprovalCarId + "/documents")
                .content("{\"docType\":\"REGISTRATION\",\"fileUrl\":\"/images/docs/cavet.jpg\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        Long docId = ((Number) JsonPath.read(doc, "$.data.id")).longValue();
        // Giấy tờ còn chờ xác minh => vẫn chưa duyệt được
        as(adminId, post("/api/admin/cars/" + pendingApprovalCarId + "/approve")).andExpect(status().isConflict());

        as(adminId, patch("/api/admin/cars/" + pendingApprovalCarId + "/documents/" + docId + "/verify")
                .content("{\"verifyStatus\":\"APPROVED\"}")).andExpect(status().isOk());
        as(adminId, post("/api/admin/cars/" + pendingApprovalCarId + "/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    // ===================================================================== F2-06

    @Test
    void carImageAndDocumentUrlsRejectScriptSchemes() throws Exception {
        for (String bad : List.of("javascript:alert(1)", "data:text/html;base64,PHNjcmlwdD4=", "//evil.example/x.png", "ftp://x/y.png")) {
            as(ownerId, post("/api/cars/" + carId + "/images").content("[{\"imageUrl\":\"" + bad + "\"}]"))
                    .andExpect(status().isBadRequest());
            as(ownerId, post("/api/cars/" + carId + "/documents")
                    .content("{\"docType\":\"INSURANCE\",\"fileUrl\":\"" + bad + "\"}"))
                    .andExpect(status().isBadRequest());
        }
        as(ownerId, post("/api/cars/" + carId + "/images")
                .content("[{\"imageUrl\":\"https://cdn.example.com/a.jpg\"},{\"imageUrl\":\"/images/cars/a.jpg\"}]"))
                .andExpect(status().isOk());
    }

    // ===================================================================== F2-07

    @Test
    void publicSearchRejectsNonsenseParameters() throws Exception {
        mockMvc.perform(get("/api/cars/search").param("page", "-1")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/cars/search").param("sortBy", "passwordHash")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/cars/search").param("seats", "-5")).andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/cars/search").param("minPrice", "900000").param("maxPrice", "100000"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/api/cars/search").param("minPrice", "100000").param("maxPrice", "900000")
                .param("sortBy", "rentalPricePerDay").param("direction", "asc")).andExpect(status().isOk());
    }

    // ===================================================================== F4-04 / F4-05

    @Test
    void packagePaymentDefaultsToVnpayAndUsesProperErrorCodes() throws Exception {
        Long subId = create(null);
        as(ownerId, post("/api/transactions/package-payment").content("{\"subscriptionId\":" + subId + "}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.method").value("VNPAY"));
        as(ownerId, post("/api/transactions/package-payment").content("{\"subscriptionId\":999999}"))
                .andExpect(status().isNotFound());
        as(otherId, post("/api/transactions/package-payment").content("{\"subscriptionId\":" + subId + "}"))
                .andExpect(status().isForbidden());
    }

    // ===================================================================== F4-02

    @Test
    void reviewsAreRejectedForCarsThatAreNotApproved() throws Exception {
        as(plainCustomerId, post("/api/reviews").content("{\"carId\":" + rejectedCarId + ",\"rating\":1,\"comment\":\"x\"}"))
                .andExpect(status().isNotFound());
        as(plainCustomerId, post("/api/reviews").content("{\"carId\":" + pendingApprovalCarId + ",\"rating\":5}"))
                .andExpect(status().isNotFound());
    }

    // ===================================================================== helpers

    private ResultActions as(Long userId, MockHttpServletRequestBuilder req) throws Exception {
        Customer customer = customerRepository.findById(userId).orElseThrow();
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                new CurrentAccount(customer.getId(), customer.getRole()), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + customer.getRole().name()))));
        try {
            return mockMvc.perform(req.contentType(MediaType.APPLICATION_JSON));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private Long create(String voucherCode) throws Exception {
        String body = as(ownerId, post("/api/subscriptions").content(json(carId, packageId, voucherCode)))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.data.id")).longValue();
    }

    private static String json(Long car, Long listingPackage, String voucherCode) {
        return "{\"carId\":" + car + ",\"packageId\":" + listingPackage
                + (voucherCode == null ? "" : ",\"voucherCode\":\"" + voucherCode + "\"") + "}";
    }

    private Car car() {
        return carRepository.findById(carId).orElseThrow();
    }

    private CarSubscription subscription(Long id) {
        return subscriptionRepository.findById(id).orElseThrow();
    }

    private int voucherUsedCount() {
        return voucherRepository.findById(voucherId).orElseThrow().getUsedCount();
    }

    private static Customer customer(String name, String email, String phone, Role role) {
        return Customer.builder().fullName(name).email(email).phone(phone).passwordHash("{noop}test")
                .role(role).kycStatus(role == Role.OWNER ? KycStatus.VERIFIED : KycStatus.NONE)
                .status(CustomerStatus.ACTIVE).build();
    }

    private static Car car(Customer owner, String plate, CarStatus status) {
        return Car.builder().owner(owner).licensePlate(plate).brand("Toyota").model("Vios").manufactureYear(2022)
                .carType(CarType.SEDAN).seats(5).transmission(Transmission.AUTOMATIC).fuelType(FuelType.GASOLINE)
                .city("Hồ Chí Minh").pickupAddress("1 Lê Lợi").status(status).build();
    }

    private static ListingPackage listingPackage(String code, int days, boolean onSale) {
        return ListingPackage.builder().name(code).code(code).price(new BigDecimal("180000")).durationDays(days)
                .slotCount(1).durationDaysPerSlot(days)
                .isActive(onSale).build();
    }

    private Voucher voucher(String code, DiscountType type, String value, String maxDiscount) {
        return Voucher.builder().code(code).discountType(type).discountValue(new BigDecimal(value))
                .maxDiscount(maxDiscount == null ? null : new BigDecimal(maxDiscount)).minOrderAmount(BigDecimal.ZERO)
                .startAt(now.minusDays(1)).endAt(now.plusDays(90)).usageLimit(10).perUserLimit(1).usedCount(0)
                .status(VoucherStatus.ACTIVE).build();
    }

    private <T> T persist(T entity) {
        entityManager.persist(entity);
        return entity;
    }
}
