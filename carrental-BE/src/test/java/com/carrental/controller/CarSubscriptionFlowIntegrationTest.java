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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test toàn bộ luồng Function 3 qua REST API trên H2: báo giá -> mua gói -> kích hoạt -> hết hạn -> gia hạn -> huỷ.
 * Gói 30 ngày giá 180.000đ.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class CarSubscriptionFlowIntegrationTest {

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
    @Autowired private ApplicationEventPublisher eventPublisher;
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
    private Long packageId;
    private Long stoppedPackageId;
    private Long voucherId;

    @BeforeEach
    void seed() {
        now = LocalDateTime.now(VN);
        clock.setTo(now);
        tx.executeWithoutResult(s -> {
            for (String entity : List.of("HandoverItem", "Handover", "Booking", "CarSafetyRecord", "Transaction", "Review", "CarSubscription", "CarImage", "CarDocument", "Car",
                    "ListingPackage", "Voucher", "Customer")) {
                entityManager.createQuery("delete from " + entity).executeUpdate();
            }
            Customer owner = persist(customer("Chủ Xe", "owner@sub.vn", "0930000001", Role.OWNER));
            Customer other = persist(customer("Chủ Khác", "other@sub.vn", "0930000002", Role.OWNER));
            Customer plainCustomer = persist(customer("Khách Hàng", "customer@sub.vn", "0930000004", Role.CUSTOMER));
            plainCustomerId = plainCustomer.getId();
            Customer admin = persist(customer("Admin", "admin@sub.vn", "0930000003", Role.ADMIN));
            ownerId = owner.getId();
            otherId = other.getId();
            adminId = admin.getId();
            carId = persist(car(owner, "51A-11111", CarStatus.ACTIVE)).getId();
            pendingApprovalCarId = persist(car(owner, "51A-22222", CarStatus.PENDING_APPROVAL)).getId();
            packageId = persist(listingPackage("PKG_STANDARD", 30, true)).getId();
            stoppedPackageId = persist(listingPackage("PKG_OLD", 7, false)).getId();
            voucherId = persist(voucher("GIAM10", DiscountType.PERCENT, "10", "10000")).getId();
            persist(voucher("FREE", DiscountType.FIXED, "999999", null));
        });
    }

    // ===================================================================== mua gói

    @Test
    void packagesListsOnlyOnSalePackages() throws Exception {
        as(ownerId, get("/api/subscriptions/packages"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].code").value("PKG_STANDARD"));
    }

    @Test
    void quoteAppliesVoucherWithoutWritingAnything() throws Exception {
        as(ownerId, post("/api/subscriptions/quote").content(json(carId, packageId, "giam10")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.packagePrice").value(180000))
                .andExpect(jsonPath("$.data.discountAmount").value(10000))
                .andExpect(jsonPath("$.data.totalAmount").value(170000));
        assertThat(subscriptionRepository.count()).isZero();
        assertThat(voucherUsedCount()).isZero();
    }

    @Test
    void createKeepsCarHiddenUntilPaid() throws Exception {
        as(ownerId, post("/api/subscriptions").content(json(carId, packageId, "GIAM10")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.subscriptionCode").value(matchesPattern("SUB-\\d{8}-[A-Z0-9]{4}")))
                .andExpect(jsonPath("$.data.status").value("PENDING_PAYMENT"))
                .andExpect(jsonPath("$.data.paymentStatus").value("UNPAID"))
                .andExpect(jsonPath("$.data.totalAmount").value(170000))
                .andExpect(jsonPath("$.data.daysRemaining").doesNotExist());
        assertThat(voucherUsedCount()).isEqualTo(1);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.UNLISTED);
    }

    @Test
    void customerWithoutOwnerRoleIsForbiddenFromOwnerEndpoints() throws Exception {
        as(plainCustomerId, get("/api/cars/my-cars")).andExpect(status().isForbidden());
        as(plainCustomerId, post("/api/cars").content("{\"licensePlate\":\"51A-99999\",\"brand\":\"Toyota\",\"model\":\"Vios\",\"manufactureYear\":2022,\"carType\":\"SEDAN\",\"seats\":5,\"transmission\":\"AUTOMATIC\",\"fuelType\":\"GASOLINE\",\"city\":\"Hồ Chí Minh\",\"pickupAddress\":\"1 Lê Lợi\",\"pricePerHour\":100000,\"pricePerDay\":800000,\"depositAmount\":0}")).andExpect(status().isForbidden());
        as(plainCustomerId, post("/api/subscriptions").content(json(carId, packageId, null))).andExpect(status().isForbidden());
        as(plainCustomerId, get("/api/subscriptions/my-subscriptions")).andExpect(status().isForbidden());
    }

    @Test
    void createRejectsInvalidRequests() throws Exception {
        as(otherId, post("/api/subscriptions").content(json(carId, packageId, null))).andExpect(status().isForbidden());
        as(ownerId, post("/api/subscriptions").content(json(pendingApprovalCarId, packageId, null))).andExpect(status().isBadRequest());
        as(ownerId, post("/api/subscriptions").content(json(carId, stoppedPackageId, null))).andExpect(status().isBadRequest());
        as(ownerId, post("/api/subscriptions").content(json(carId, 999999L, null))).andExpect(status().isNotFound());
        as(ownerId, post("/api/subscriptions").content(json(carId, packageId, "KHONG_CO"))).andExpect(status().isBadRequest());
        as(ownerId, post("/api/subscriptions").content(json(null, packageId, null))).andExpect(status().isBadRequest());
        assertThat(subscriptionRepository.count()).isZero();
    }

    @Test
    void carCannotHaveTwoLiveSubscriptions() throws Exception {
        Long id = create(null);
        as(ownerId, post("/api/subscriptions").content(json(carId, packageId, null))).andExpect(status().isConflict());
        subscriptionService.activateSubscription(id);
        as(ownerId, post("/api/subscriptions").content(json(carId, packageId, null))).andExpect(status().isConflict());
    }

    @Test
    void voucherPerUserLimitCountsLiveSubscriptions() throws Exception {
        Long id = create("GIAM10");
        subscriptionService.activateSubscription(id);
        clock.advance(Duration.ofDays(31));
        subscriptionService.expireSubscription(id);
        as(ownerId, post("/api/subscriptions").content(json(carId, packageId, "GIAM10"))).andExpect(status().isBadRequest());
    }

    @Test
    void voucherCoveringWholePriceActivatesImmediately() throws Exception {
        as(ownerId, post("/api/subscriptions").content(json(carId, packageId, "FREE")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.totalAmount").value(0));
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);
    }

    // ===================================================================== kích hoạt

    @Test
    void activateTurnsListingOnAndIsIdempotent() throws Exception {
        Long id = create(null);
        subscriptionService.activateSubscription(id);

        CarSubscription subscription = subscription(id);
        assertThat(subscription.getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(subscription.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(subscription.getEndDate()).isEqualTo(subscription.getStartDate().plusDays(30));
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);
        assertThat(car().getCurrentSubscriptionId()).isEqualTo(id);

        clock.advance(Duration.ofDays(12));
        as(ownerId, get("/api/subscriptions/" + id)).andExpect(jsonPath("$.data.daysRemaining").value(18));

        LocalDateTime firstEnd = subscription.getEndDate();
        subscriptionService.activateSubscription(id);
        assertThat(subscription(id).getEndDate()).isEqualTo(firstEnd);
    }

    @Test
    void cancelledSubscriptionCannotBeActivated() throws Exception {
        Long id = create(null);
        as(ownerId, put("/api/subscriptions/" + id + "/cancel")).andExpect(status().isOk());
        org.junit.jupiter.api.Assertions.assertThrows(com.carrental.exception.AppException.class,
                () -> subscriptionService.activateSubscription(id));
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.UNLISTED);
    }

    /** Nối với Function 4: sự kiện thanh toán thành công phải kích hoạt gói. */
    @Test
    void paymentCompletedEventActivatesSubscription() throws Exception {
        Long id = create(null);
        String body = as(ownerId, post("/api/transactions/package-payment")
                .content("{\"subscriptionId\":" + id + ",\"method\":\"VNPAY\"}"))
                .andExpect(status().isOk()).andReturn().getResponse().getContentAsString();
        long transactionId = ((Number) JsonPath.read(body, "$.data.id")).longValue();

        Transaction transaction = tx.execute(s -> transactionRepository.findByIdForUpdate(transactionId).orElseThrow());
        eventPublisher.publishEvent(new PaymentCompletedEvent(transaction));

        assertThat(subscription(id).getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(subscription(id).getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);
        assertThat(car().getCurrentSubscriptionId()).isEqualTo(id);
    }

    // ===================================================================== hết hạn & gia hạn

    @Test
    void expiredSubscriptionHidesListingThenRenewalShowsItAgain() throws Exception {
        Long id = create(null);
        subscriptionService.activateSubscription(id);

        assertThat(subscriptionService.findExpiredSubscriptionIds()).isEmpty();
        assertThat(subscriptionService.expireSubscription(id)).isFalse();

        clock.advance(Duration.ofDays(30).plusMinutes(1));
        assertThat(subscriptionService.findExpiredSubscriptionIds()).containsExactly(id);
        assertThat(subscriptionService.expireSubscription(id)).isTrue();
        assertThat(subscriptionService.expireSubscription(id)).isFalse();
        assertThat(subscription(id).getStatus()).isEqualTo(SubscriptionStatus.EXPIRED);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.EXPIRED);

        Long renewal = create(null);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.EXPIRED);
        subscriptionService.activateSubscription(renewal);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);
        assertThat(car().getCurrentSubscriptionId()).isEqualTo(renewal);
    }

    @Test
    void expiringOldSubscriptionDoesNotHideCarUsingNewerOne() throws Exception {
        Long id = create(null);
        subscriptionService.activateSubscription(id);
        tx.executeWithoutResult(s -> carRepository.findById(carId).orElseThrow().setCurrentSubscriptionId(id + 1000));

        clock.advance(Duration.ofDays(31));
        assertThat(subscriptionService.expireSubscription(id)).isTrue();
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);
    }

    @Test
    void overduePendingIsCancelledAndReturnsVoucher() throws Exception {
        Long id = create("GIAM10");
        assertThat(subscriptionService.findOverduePendingIds()).isEmpty();
        assertThat(subscriptionService.cancelOverduePending(id)).isFalse();

        clock.advance(Duration.ofMinutes(35));
        assertThat(subscriptionService.findOverduePendingIds()).containsExactly(id);
        assertThat(subscriptionService.cancelOverduePending(id)).isTrue();
        assertThat(subscriptionService.cancelOverduePending(id)).isFalse();

        assertThat(subscription(id).getStatus()).isEqualTo(SubscriptionStatus.CANCELLED);
        assertThat(voucherUsedCount()).isZero();
        create("GIAM10"); // lượt voucher và xe đều được trả lại
    }

    // ===================================================================== huỷ

    @Test
    void ownerCancelsOnlyUnpaidSubscription() throws Exception {
        Long id = create("GIAM10");
        as(otherId, put("/api/subscriptions/" + id + "/cancel")).andExpect(status().isForbidden());
        as(ownerId, put("/api/subscriptions/" + id + "/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
        assertThat(voucherUsedCount()).isZero();
        as(ownerId, put("/api/subscriptions/" + id + "/cancel")).andExpect(status().isBadRequest());

        Long paid = create(null);
        subscriptionService.activateSubscription(paid);
        as(ownerId, put("/api/subscriptions/" + paid + "/cancel")).andExpect(status().isForbidden());
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);
    }

    @Test
    void adminCancellingActiveSubscriptionHidesListing() throws Exception {
        Long id = create(null);
        subscriptionService.activateSubscription(id);
        as(adminId, put("/api/subscriptions/" + id + "/cancel")).andExpect(status().isOk());
        assertThat(subscription(id).getStatus()).isEqualTo(SubscriptionStatus.CANCELLED);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.UNLISTED);
    }

    @Test
    void cancellingRenewalKeepsCarExpired() throws Exception {
        Long id = create(null);
        subscriptionService.activateSubscription(id);
        clock.advance(Duration.ofDays(31));
        subscriptionService.expireSubscription(id);

        Long renewal = create(null);
        as(ownerId, put("/api/subscriptions/" + renewal + "/cancel")).andExpect(status().isOk());
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.EXPIRED);
    }

    // ===================================================================== xem & phân quyền

    @Test
    void viewsAreLimitedToBuyerAndAdmin() throws Exception {
        Long id = create(null);
        as(ownerId, get("/api/subscriptions/" + id)).andExpect(status().isOk());
        as(adminId, get("/api/subscriptions/" + id)).andExpect(status().isOk());
        as(otherId, get("/api/subscriptions/" + id)).andExpect(status().isForbidden());
        as(ownerId, get("/api/subscriptions/999999")).andExpect(status().isNotFound());

        as(ownerId, get("/api/subscriptions/my-subscriptions")).andExpect(jsonPath("$.data.totalElements").value(1));
        as(otherId, get("/api/subscriptions/my-subscriptions")).andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void adminListFiltersByStatusAndIsAdminOnly() throws Exception {
        create(null);
        as(ownerId, get("/api/admin/subscriptions")).andExpect(status().isForbidden());
        as(adminId, get("/api/admin/subscriptions")).andExpect(jsonPath("$.data.totalElements").value(1));
        as(adminId, get("/api/admin/subscriptions").param("status", "PENDING_PAYMENT"))
                .andExpect(jsonPath("$.data.content[0].carName").value("Toyota Vios"));
        as(adminId, get("/api/admin/subscriptions").param("status", "ACTIVE")).andExpect(jsonPath("$.data.totalElements").value(0));
    }

    @Test
    void multiSlotPackageFlowAndActivation() throws Exception {
        Long slotPkgId = tx.execute(s -> persist(ListingPackage.builder()
                .name("Gói 3 Slots")
                .code("PKG_SLOT_3")
                .price(new BigDecimal("90000"))
                .durationDays(9)
                .slotCount(3)
                .durationDaysPerSlot(3)
                .isActive(true)
                .build()).getId());

        String body = as(ownerId, post("/api/subscriptions").content("{\"carId\":" + carId + ",\"packageId\":" + slotPkgId + "}"))
                .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString();
        Long subId = ((Number) JsonPath.read(body, "$.data.id")).longValue();

        subscriptionService.activateSubscription(subId);

        CarSubscription sub = subscription(subId);
        assertThat(sub.getTotalSlots()).isEqualTo(3);
        assertThat(sub.getRemainingSlots()).isEqualTo(2);
        assertThat(sub.getCurrentSlotStartDate()).isNotNull();
        assertThat(sub.getCurrentSlotEndDate()).isNotNull();
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);

        // Cannot activate next slot while current slot is still active
        as(ownerId, post("/api/subscriptions/" + subId + "/activate-slot"))
                .andExpect(status().isConflict());

        // Advance 3 days + 1 min: 1st slot expires
        clock.advance(Duration.ofDays(3).plusMinutes(1));
        assertThat(subscriptionService.findExpiredSubscriptionIds()).contains(subId);
        assertThat(subscriptionService.expireSubscription(subId)).isTrue();

        // Car is UNLISTED, subscription is still ACTIVE with 2 slots remaining
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.UNLISTED);
        assertThat(subscription(subId).getStatus()).isEqualTo(SubscriptionStatus.ACTIVE);
        assertThat(subscription(subId).getRemainingSlots()).isEqualTo(2);

        // Owner activates 2nd slot
        as(ownerId, post("/api/subscriptions/" + subId + "/activate-slot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.remainingSlots").value(1));
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);

        // Advance 3 days + 1 min: 2nd slot expires
        clock.advance(Duration.ofDays(3).plusMinutes(1));
        subscriptionService.expireSubscription(subId);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.UNLISTED);
        assertThat(subscription(subId).getRemainingSlots()).isEqualTo(1);

        // Owner activates 3rd (last) slot
        as(ownerId, post("/api/subscriptions/" + subId + "/activate-slot"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.remainingSlots").value(0));
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.LISTED);

        // Advance 3 days + 1 min: last slot expires -> subscription and car EXPIRED!
        clock.advance(Duration.ofDays(3).plusMinutes(1));
        subscriptionService.expireSubscription(subId);
        assertThat(car().getListingStatus()).isEqualTo(ListingStatus.EXPIRED);
        assertThat(subscription(subId).getStatus()).isEqualTo(SubscriptionStatus.EXPIRED);

        // Cannot activate anymore when 0 slots remain
        as(ownerId, post("/api/subscriptions/" + subId + "/activate-slot"))
                .andExpect(status().isBadRequest());
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
