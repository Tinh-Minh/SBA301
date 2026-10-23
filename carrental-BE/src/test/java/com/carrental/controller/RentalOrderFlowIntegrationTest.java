package com.carrental.controller;

import com.carrental.TestJwtKeys;
import com.carrental.entity.Car;
import com.carrental.entity.CarSlot;
import com.carrental.entity.Customer;
import com.carrental.entity.Voucher;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.FuelType;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.RentalOption;
import com.carrental.enums.Role;
import com.carrental.enums.SlotStatus;
import com.carrental.enums.Transmission;
import com.carrental.enums.VoucherStatus;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.RentalOrderService;
import com.carrental.support.MutableClock;
import com.jayway.jsonpath.JsonPath;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test toàn bộ luồng Function 3 qua REST API trên H2:
 * báo giá -> tạo đơn -> chống trùng lịch -> xác nhận/từ chối/huỷ/hết hạn -> bàn giao nhận/trả -> log.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class RentalOrderFlowIntegrationTest {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 1, 8, 0);

    @TestConfiguration
    static class ClockConfig {
        @Bean
        @Primary
        MutableClock testClock() {
            return new MutableClock(NOW, VN);
        }
    }

    @DynamicPropertySource
    static void securityProperties(DynamicPropertyRegistry properties) {
        properties.add("app.security.jwt.issuer", () -> TestJwtKeys.ISSUER);
        properties.add("app.security.jwt.audience", () -> TestJwtKeys.AUDIENCE);
        properties.add("app.security.jwt.access-token-ttl", () -> "PT30M");
        properties.add("app.security.jwt.clock-skew", () -> "PT30S");
        properties.add("app.security.jwt.private-key-location", TestJwtKeys::privateKeyLocation);
        properties.add("app.security.jwt.public-key-location", TestJwtKeys::publicKeyLocation);
    }

    @Autowired private MockMvc mockMvc;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private MutableClock clock;
    @Autowired private VoucherRepository voucherRepository;
    @Autowired private RentalOrderRepository rentalOrderRepository;
    @Autowired private RentalOrderService rentalOrderService;
    @Autowired private EntityManager entityManager;
    @Autowired private TransactionTemplate tx;

    private Long ownerId;
    private Long renterId;
    private Long otherRenterId;
    private Long strangerId;
    private Long adminId;
    private Long slotId;
    private Long voucherId;

    @BeforeEach
    void seed() {
        clock.setTo(NOW);
        tx.executeWithoutResult(s -> {
            entityManager.createQuery("delete from HandoverImage").executeUpdate();
            entityManager.createQuery("delete from OrderHandover").executeUpdate();
            entityManager.createQuery("delete from ActionLog").executeUpdate();
            entityManager.createQuery("delete from RentalOrder").executeUpdate();
            entityManager.createQuery("delete from CarSlot").executeUpdate();
            entityManager.createQuery("delete from Car").executeUpdate();
            entityManager.createQuery("delete from Voucher").executeUpdate();
            entityManager.createQuery("delete from Customer").executeUpdate();

            Customer owner = persist(customer("Chủ Xe", "owner@test.vn", "0900000001", Role.CUSTOMER));
            Customer renter = persist(customer("Người Thuê", "renter@test.vn", "0900000002", Role.CUSTOMER));
            Customer other = persist(customer("Người Thuê 2", "renter2@test.vn", "0900000003", Role.CUSTOMER));
            Customer stranger = persist(customer("Người Lạ", "stranger@test.vn", "0900000004", Role.CUSTOMER));
            Customer admin = persist(customer("Admin", "admin@test.vn", "0900000005", Role.ADMIN));

            Car car = persist(Car.builder().owner(owner).licensePlate("51A-12345").brand("Toyota").model("Vios")
                    .manufactureYear(2022).carType(CarType.SEDAN).seats(5).transmission(Transmission.AUTOMATIC)
                    .fuelType(FuelType.GASOLINE).city("Hồ Chí Minh").pickupAddress("1 Lê Lợi, Quận 1")
                    .pricePerHour(new BigDecimal("100000")).pricePerDay(new BigDecimal("800000"))
                    .depositAmount(new BigDecimal("2000000")).status(CarStatus.ACTIVE).build());
            CarSlot slot = persist(CarSlot.builder().car(car)
                    .startTime(LocalDateTime.of(2026, 11, 2, 0, 0))
                    .endTime(LocalDateTime.of(2026, 11, 10, 0, 0))
                    .pricePerHour(new BigDecimal("100000")).pricePerDay(new BigDecimal("800000"))
                    .rentalOption(RentalOption.BOTH).minRentalHours(4).status(SlotStatus.OPEN).build());
            Voucher voucher = persist(Voucher.builder().code("GIAM10").discountType(DiscountType.PERCENT)
                    .discountValue(new BigDecimal("10")).maxDiscount(new BigDecimal("200000"))
                    .minOrderAmount(BigDecimal.ZERO).startAt(NOW.minusDays(1)).endAt(NOW.plusDays(30))
                    .usageLimit(10).perUserLimit(1).usedCount(0).status(VoucherStatus.ACTIVE).build());

            ownerId = owner.getId();
            renterId = renter.getId();
            otherRenterId = other.getId();
            strangerId = stranger.getId();
            adminId = admin.getId();
            slotId = slot.getId();
            voucherId = voucher.getId();
        });
    }

    // ===================================================================== luồng chính

    @Test
    void fullLifecycle_createConfirmPickupReturn() throws Exception {
        // Báo giá: 2 ngày 2 giờ -> làm tròn 3 ngày * 800k = 2.4tr, giảm 10% tối đa 200k
        as(renterId, post("/api/orders/quote").content(orderJson("DAILY", "2026-11-03T08:00:00", "2026-11-05T10:00:00", "GIAM10", null)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.quantity").value(3))
                .andExpect(jsonPath("$.data.rentalAmount").value(2400000))
                .andExpect(jsonPath("$.data.discountAmount").value(200000))
                .andExpect(jsonPath("$.data.totalAmount").value(2200000))
                .andExpect(jsonPath("$.data.depositAmount").value(2000000));

        Long orderId = createOrder(renterId, "DAILY", "2026-11-03T08:00:00", "2026-11-05T10:00:00", "GIAM10");
        assertThat(voucherUsedCount()).isEqualTo(1);

        // Người khác đặt trùng giờ -> 409
        as(otherRenterId, post("/api/orders").content(orderJson("HOURLY", "2026-11-04T08:00:00", "2026-11-04T14:00:00", null, null)))
                .andExpect(status().isConflict());

        // Đặt nối tiếp ngay sau giờ trả (khoảng [start,end) không chồng) -> OK
        createOrder(otherRenterId, "HOURLY", "2026-11-05T10:00:00", "2026-11-05T14:00:00", null);

        // Chủ xe xác nhận
        as(ownerId, put("/api/orders/" + orderId + "/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"));

        // Nhận xe quá sớm -> 400
        as(renterId, post("/api/orders/" + orderId + "/handovers").content(handoverJson("PICKUP", 1000)))
                .andExpect(status().isBadRequest());

        // Đến giờ: người thuê lập biên bản nhận xe, chủ xe xác nhận -> ONGOING
        clock.setTo(LocalDateTime.of(2026, 11, 3, 7, 30));
        Long pickupId = createHandover(renterId, orderId, "PICKUP", 1000);
        assertOrderStatus(orderId, OrderStatus.CONFIRMED);
        as(renterId, put("/api/handovers/" + pickupId + "/confirm")).andExpect(status().isConflict());
        as(ownerId, put("/api/handovers/" + pickupId + "/confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.fullyConfirmed").value(true));
        assertOrderStatus(orderId, OrderStatus.ONGOING);

        // Đang thuê thì không huỷ được
        as(renterId, put("/api/orders/" + orderId + "/cancel")).andExpect(status().isConflict());

        // Trả xe: số km nhỏ hơn lúc nhận -> 400; hợp lệ -> chủ xe lập, người thuê xác nhận -> COMPLETED
        clock.setTo(LocalDateTime.of(2026, 11, 5, 11, 0));
        as(ownerId, post("/api/orders/" + orderId + "/handovers").content(handoverJson("RETURN", 900)))
                .andExpect(status().isBadRequest());
        Long returnId = createHandover(ownerId, orderId, "RETURN", 1350);
        as(renterId, put("/api/handovers/" + returnId + "/confirm")).andExpect(status().isOk());

        as(renterId, get("/api/orders/" + orderId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.actualStartTime").value("2026-11-03T07:30:00"))
                .andExpect(jsonPath("$.data.actualEndTime").value("2026-11-05T11:00:00"));

        as(ownerId, get("/api/orders/" + orderId + "/handovers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[0].images.length()").value(1));

        as(renterId, get("/api/orders/" + orderId + "/logs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(8))
                .andExpect(jsonPath("$.data[*].action").value(hasItem("PICKUP")))
                .andExpect(jsonPath("$.data[7].action").value("RETURN"))
                .andExpect(jsonPath("$.data[7].note").value("Trả xe trễ so với giờ hẹn 2026-11-05T10:00"));
    }

    // ===================================================================== từ chối / huỷ / hết hạn

    @Test
    void reject_requiresReason_andReleasesVoucher() throws Exception {
        Long orderId = createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", "GIAM10");
        assertThat(voucherUsedCount()).isEqualTo(1);

        // Đã dùng hết lượt voucher của mỗi người -> báo giá lại bị từ chối
        as(renterId, post("/api/orders/quote").content(orderJson("HOURLY", "2026-11-06T08:00:00", "2026-11-06T14:00:00", "GIAM10", null)))
                .andExpect(status().isBadRequest());

        as(ownerId, put("/api/orders/" + orderId + "/reject")).andExpect(status().isBadRequest());
        as(ownerId, put("/api/orders/" + orderId + "/reject").content("{\"reason\":\"Xe đang bảo dưỡng\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("REJECTED"))
                .andExpect(jsonPath("$.data.cancelReason").value("Xe đang bảo dưỡng"));

        assertThat(voucherUsedCount()).isZero();
        // Đơn bị từ chối không còn giữ lịch -> đặt lại cùng giờ được
        createOrder(otherRenterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", null);
    }

    @Test
    void renterCancel_freesSchedule_andCannotConfirmAfterwards() throws Exception {
        Long orderId = createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", null);
        as(renterId, put("/api/orders/" + orderId + "/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.cancelledById").value(renterId));

        as(ownerId, put("/api/orders/" + orderId + "/confirm")).andExpect(status().isConflict());
        createOrder(otherRenterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", null);
    }

    @Test
    void ownerCancelConfirmedOrder_requiresReason() throws Exception {
        Long orderId = createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", null);
        as(ownerId, put("/api/orders/" + orderId + "/confirm")).andExpect(status().isOk());
        as(ownerId, put("/api/orders/" + orderId + "/cancel")).andExpect(status().isBadRequest());
        as(ownerId, put("/api/orders/" + orderId + "/cancel").content("{\"reason\":\"Xe hỏng đột xuất\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    void overduePendingOrder_isExpiredBySystem() throws Exception {
        Long orderId = createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", "GIAM10");
        // Hạn xác nhận = min(tạo đơn + 24h, giờ nhận xe) = 2026-11-02 08:00
        as(renterId, get("/api/orders/" + orderId))
                .andExpect(jsonPath("$.data.expiresAt").value("2026-11-02T08:00:00"));

        assertThat(rentalOrderService.findOverduePendingOrderIds()).isEmpty();
        clock.setTo(LocalDateTime.of(2026, 11, 2, 8, 1));
        List<Long> overdue = rentalOrderService.findOverduePendingOrderIds();
        assertThat(overdue).containsExactly(orderId);
        assertThat(rentalOrderService.expireOrder(orderId)).isTrue();
        assertThat(rentalOrderService.expireOrder(orderId)).isFalse();

        assertOrderStatus(orderId, OrderStatus.EXPIRED);
        assertThat(voucherUsedCount()).isZero();
        as(ownerId, put("/api/orders/" + orderId + "/confirm")).andExpect(status().isConflict());
        as(renterId, get("/api/orders/" + orderId + "/logs"))
                .andExpect(jsonPath("$.data[1].action").value("EXPIRE"))
                .andExpect(jsonPath("$.data[1].actorId").doesNotExist())
                .andExpect(jsonPath("$.data[1].actorName").value("Hệ thống"));
    }

    @Test
    void confirmAfterDeadline_isRejected() throws Exception {
        Long orderId = createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", null);
        clock.setTo(LocalDateTime.of(2026, 11, 2, 9, 0));
        as(ownerId, put("/api/orders/" + orderId + "/confirm")).andExpect(status().isConflict());
    }

    // ===================================================================== quyền & dữ liệu vào

    @Test
    void permissions() throws Exception {
        Long orderId = createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T14:00:00", null);

        mockMvc.perform(get("/api/orders/" + orderId)).andExpect(status().isUnauthorized());
        as(strangerId, get("/api/orders/" + orderId)).andExpect(status().isForbidden());
        as(adminId, get("/api/orders/" + orderId)).andExpect(status().isOk());
        as(renterId, put("/api/orders/" + orderId + "/confirm")).andExpect(status().isForbidden());
        as(strangerId, put("/api/orders/" + orderId + "/cancel")).andExpect(status().isForbidden());
        as(renterId, get("/api/orders")).andExpect(status().isForbidden());
        as(adminId, get("/api/orders").param("status", "PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(1));

        // Chủ xe không tự thuê xe của mình
        as(ownerId, post("/api/orders").content(orderJson("HOURLY", "2026-11-06T08:00:00", "2026-11-06T14:00:00", null, null)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validationAndBusinessRules() throws Exception {
        as(renterId, post("/api/orders").content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[*].field", hasItem("carSlotId")))
                .andExpect(jsonPath("$.errors[*].field", hasItem("rentalType")));

        // Dưới số giờ tối thiểu (4h)
        as(renterId, post("/api/orders").content(orderJson("HOURLY", "2026-11-03T08:00:00", "2026-11-03T10:00:00", null, null)))
                .andExpect(status().isBadRequest());
        // Ngoài slot
        as(renterId, post("/api/orders").content(orderJson("DAILY", "2026-11-09T08:00:00", "2026-11-11T08:00:00", null, null)))
                .andExpect(status().isBadRequest());
        // Voucher không tồn tại
        as(renterId, post("/api/orders").content(orderJson("DAILY", "2026-11-03T08:00:00", "2026-11-04T08:00:00", "KHONGCO", null)))
                .andExpect(status().isBadRequest());
        // Slot không tồn tại
        as(renterId, post("/api/orders").content("{\"carSlotId\":999999,\"rentalType\":\"DAILY\",\"startTime\":\"2026-11-03T08:00:00\",\"endTime\":\"2026-11-04T08:00:00\"}"))
                .andExpect(status().isNotFound());
        // Sắp xếp theo cột không cho phép
        as(renterId, get("/api/orders/my-rentals").param("sortBy", "password"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listsArePagedAndScopedPerUser() throws Exception {
        createOrder(renterId, "HOURLY", "2026-11-03T08:00:00", "2026-11-03T12:00:00", null);
        createOrder(renterId, "HOURLY", "2026-11-04T08:00:00", "2026-11-04T12:00:00", null);
        createOrder(otherRenterId, "HOURLY", "2026-11-05T08:00:00", "2026-11-05T12:00:00", null);

        as(renterId, get("/api/orders/my-rentals").param("size", "1").param("sortBy", "startTime").param("direction", "asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.totalElements").value(2))
                .andExpect(jsonPath("$.data.totalPages").value(2))
                .andExpect(jsonPath("$.data.content[0].startTime").value("2026-11-03T08:00:00"));

        as(ownerId, get("/api/orders/my-cars"))
                .andExpect(jsonPath("$.data.totalElements").value(3));
        as(ownerId, get("/api/orders/my-rentals"))
                .andExpect(jsonPath("$.data.totalElements").value(0));
    }

    // ===================================================================== helpers

    private ResultActions as(Long userId,
                             org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder req)
            throws Exception {
        Customer customer = customerRepository.findById(userId).orElseThrow();
        CurrentAccount account = new CurrentAccount(customer.getId(), customer.getRole());
        SecurityContextHolder.getContext().setAuthentication(UsernamePasswordAuthenticationToken.authenticated(
                account, null, List.of(new SimpleGrantedAuthority("ROLE_" + customer.getRole().name()))));
        try {
            return mockMvc.perform(req.contentType(MediaType.APPLICATION_JSON));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }

    private Long createOrder(Long userId, String type, String start, String end, String voucher) throws Exception {
        String body = as(userId, post("/api/orders").content(orderJson(type, start, end, voucher, "ghi chú")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.data.id")).longValue();
    }

    private Long createHandover(Long userId, Long orderId, String type, int km) throws Exception {
        String body = as(userId, post("/api/orders/" + orderId + "/handovers").content(handoverJson(type, km)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return ((Number) JsonPath.read(body, "$.data.id")).longValue();
    }

    private String orderJson(String type, String start, String end, String voucher, String note) {
        return "{\"carSlotId\":" + slotId + ",\"rentalType\":\"" + type + "\",\"startTime\":\"" + start
                + "\",\"endTime\":\"" + end + "\""
                + (voucher == null ? "" : ",\"voucherCode\":\"" + voucher + "\"")
                + (note == null ? "" : ",\"note\":\"" + note + "\"") + "}";
    }

    private static String handoverJson(String type, int km) {
        return "{\"handoverType\":\"" + type + "\",\"odometerKm\":" + km + ",\"fuelPercent\":80,"
                + "\"conditionNote\":\"Xe sạch, không trầy\","
                + "\"images\":[{\"imageUrl\":\"https://img.test/" + type + ".jpg\",\"caption\":\"Mặt trước\"}]}";
    }

    private void assertOrderStatus(Long orderId, OrderStatus expected) {
        assertThat(rentalOrderRepository.findById(orderId).orElseThrow().getStatus()).isEqualTo(expected);
    }

    private int voucherUsedCount() {
        return voucherRepository.findById(voucherId).orElseThrow().getUsedCount();
    }

    private static Customer customer(String name, String email, String phone, Role role) {
        return Customer.builder().fullName(name).email(email).phone(phone).passwordHash("{noop}test")
                .role(role).status(CustomerStatus.ACTIVE).build();
    }

    private <T> T persist(T entity) {
        entityManager.persist(entity);
        return entity;
    }

}
