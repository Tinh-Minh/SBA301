package com.carrental.service;

import com.carrental.dto.response.PriceQuoteDTO;
import com.carrental.entity.Car;
import com.carrental.entity.CarSlot;
import com.carrental.entity.Voucher;
import com.carrental.enums.CarStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.RentalOption;
import com.carrental.enums.RentalType;
import com.carrental.enums.SlotStatus;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.impl.PricingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingServiceImplTest {

    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");
    /** "Bây giờ" cố định: 2026-10-10 08:00 giờ VN. */
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 10, 10, 8, 0);

    @Mock
    private VoucherRepository voucherRepository;
    @Mock
    private RentalOrderRepository rentalOrderRepository;

    private PricingServiceImpl pricingService;
    private CarSlot slot;

    @BeforeEach
    void setUp() {
        Clock clock = Clock.fixed(NOW.atZone(VN).toInstant(), VN);
        pricingService = new PricingServiceImpl(voucherRepository, rentalOrderRepository, clock);

        Car car = Car.builder().id(1L).status(CarStatus.ACTIVE).depositAmount(new BigDecimal("2000000")).build();
        slot = CarSlot.builder()
                .id(10L).car(car)
                .startTime(LocalDateTime.of(2026, 10, 12, 0, 0))
                .endTime(LocalDateTime.of(2026, 10, 20, 0, 0))
                .pricePerHour(new BigDecimal("100000"))
                .pricePerDay(new BigDecimal("800000"))
                .rentalOption(RentalOption.BOTH)
                .minRentalHours(4)
                .status(SlotStatus.OPEN)
                .build();
    }

    private Voucher voucher(DiscountType type, String value, String max, String minOrder) {
        return Voucher.builder()
                .id(5L).code("SALE").discountType(type)
                .discountValue(new BigDecimal(value))
                .maxDiscount(max == null ? null : new BigDecimal(max))
                .minOrderAmount(new BigDecimal(minOrder))
                .startAt(NOW.minusDays(1)).endAt(NOW.plusDays(30))
                .usageLimit(100).perUserLimit(1).usedCount(0)
                .status(VoucherStatus.ACTIVE)
                .build();
    }

    // ---------- số lượng (làm tròn lên) ----------

    @Test
    void hourly_exactHours() {
        assertThat(pricingService.calculateQuantity(RentalType.HOURLY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 12, 13, 0))).isEqualTo(5);
    }

    @Test
    void hourly_partialHourRoundsUp() {
        assertThat(pricingService.calculateQuantity(RentalType.HOURLY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 12, 13, 1))).isEqualTo(6);
    }

    @Test
    void daily_partialDayRoundsUp() {
        assertThat(pricingService.calculateQuantity(RentalType.DAILY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 14, 9, 0))).isEqualTo(3);
    }

    @Test
    void daily_exactDays() {
        assertThat(pricingService.calculateQuantity(RentalType.DAILY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 14, 8, 0))).isEqualTo(2);
    }

    // ---------- giảm giá ----------

    @Test
    void percentDiscount_cappedByMaxDiscount() {
        Voucher v = voucher(DiscountType.PERCENT, "20", "100000", "0");
        assertThat(pricingService.calculateDiscount(v, new BigDecimal("1000000")))
                .isEqualByComparingTo("100000");
    }

    @Test
    void percentDiscount_roundsDownToWholeDong() {
        Voucher v = voucher(DiscountType.PERCENT, "15", null, "0");
        // 15% của 333333 = 49999.95 -> 49999
        assertThat(pricingService.calculateDiscount(v, new BigDecimal("333333")))
                .isEqualByComparingTo("49999");
    }

    @Test
    void fixedDiscount_neverExceedsRentalAmount() {
        Voucher v = voucher(DiscountType.FIXED, "500000", null, "0");
        assertThat(pricingService.calculateDiscount(v, new BigDecimal("300000")))
                .isEqualByComparingTo("300000");
    }

    // ---------- báo giá đầy đủ ----------

    @Test
    void quote_hourlyWithVoucher() {
        Voucher v = voucher(DiscountType.PERCENT, "10", null, "500000");
        when(voucherRepository.findByCodeIgnoreCase("sale")).thenReturn(Optional.of(v));
        when(rentalOrderRepository.countVoucherUsage(eq(5L), eq(99L), any())).thenReturn(0L);

        PriceQuoteDTO q = pricingService.quote(slot, RentalType.HOURLY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 12, 13, 30), " sale ", 99L);

        assertThat(q.getQuantity()).isEqualTo(6);
        assertThat(q.getUnitPrice()).isEqualByComparingTo("100000");
        assertThat(q.getRentalAmount()).isEqualByComparingTo("600000");
        assertThat(q.getDiscountAmount()).isEqualByComparingTo("60000");
        assertThat(q.getTotalAmount()).isEqualByComparingTo("540000");
        assertThat(q.getDepositAmount()).isEqualByComparingTo("2000000");
        assertThat(q.getVoucherId()).isEqualTo(5L);
    }

    @Test
    void quote_dailyWithoutVoucher() {
        PriceQuoteDTO q = pricingService.quote(slot, RentalType.DAILY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 13, 10, 0), null, 99L);

        assertThat(q.getQuantity()).isEqualTo(2);
        assertThat(q.getTotalAmount()).isEqualByComparingTo("1600000");
        assertThat(q.getDiscountAmount()).isEqualByComparingTo("0");
        assertThat(q.getVoucherId()).isNull();
    }

    // ---------- kiểm tra khoảng thuê ----------

    @Test
    void reject_endBeforeStart() {
        assertThatThrownBy(() -> pricingService.validateBookingWindow(slot, RentalType.HOURLY,
                LocalDateTime.of(2026, 10, 12, 13, 0), LocalDateTime.of(2026, 10, 12, 8, 0)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void reject_startInPast() {
        slot.setStartTime(NOW.minusDays(5));
        assertThatThrownBy(() -> pricingService.validateBookingWindow(slot, RentalType.HOURLY,
                NOW.minusHours(5), NOW.plusHours(1)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("quá khứ");
    }

    @Test
    void reject_outsideSlot() {
        assertThatThrownBy(() -> pricingService.validateBookingWindow(slot, RentalType.DAILY,
                LocalDateTime.of(2026, 10, 19, 8, 0), LocalDateTime.of(2026, 10, 21, 8, 0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("nằm trong slot");
    }

    @Test
    void reject_slotNotOpen() {
        slot.setStatus(SlotStatus.CLOSED);
        assertThatThrownBy(() -> pricingService.validateBookingWindow(slot, RentalType.DAILY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 13, 8, 0)))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void reject_hourlyOnDailyOnlySlot() {
        slot.setRentalOption(RentalOption.DAILY);
        assertThatThrownBy(() -> pricingService.validateBookingWindow(slot, RentalType.HOURLY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 12, 18, 0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("theo ngày");
    }

    @Test
    void reject_belowMinimumHours() {
        assertThatThrownBy(() -> pricingService.validateBookingWindow(slot, RentalType.HOURLY,
                LocalDateTime.of(2026, 10, 12, 8, 0), LocalDateTime.of(2026, 10, 12, 11, 0)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("tối thiểu");
    }

    // ---------- voucher không hợp lệ ----------

    @Test
    void voucher_notFound() {
        when(voucherRepository.findByCodeIgnoreCase("XXX")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> pricingService.resolveVoucher("XXX", new BigDecimal("1000000"), 1L))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void voucher_belowMinOrder() {
        when(voucherRepository.findByCodeIgnoreCase("SALE"))
                .thenReturn(Optional.of(voucher(DiscountType.FIXED, "50000", null, "1000000")));
        assertThatThrownBy(() -> pricingService.resolveVoucher("SALE", new BigDecimal("999999"), 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("tối thiểu");
    }

    @Test
    void voucher_expired() {
        Voucher v = voucher(DiscountType.FIXED, "50000", null, "0");
        v.setEndAt(NOW.minusMinutes(1));
        when(voucherRepository.findByCodeIgnoreCase("SALE")).thenReturn(Optional.of(v));
        assertThatThrownBy(() -> pricingService.resolveVoucher("SALE", new BigDecimal("100000"), 1L))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void voucher_usageLimitReached() {
        Voucher v = voucher(DiscountType.FIXED, "50000", null, "0");
        v.setUsedCount(100);
        when(voucherRepository.findByCodeIgnoreCase("SALE")).thenReturn(Optional.of(v));
        assertThatThrownBy(() -> pricingService.resolveVoucher("SALE", new BigDecimal("100000"), 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("hết lượt");
    }

    @Test
    void voucher_perUserLimitReached() {
        when(voucherRepository.findByCodeIgnoreCase("SALE"))
                .thenReturn(Optional.of(voucher(DiscountType.FIXED, "50000", null, "0")));
        when(rentalOrderRepository.countVoucherUsage(anyLong(), anyLong(), any())).thenReturn(1L);
        assertThatThrownBy(() -> pricingService.resolveVoucher("SALE", new BigDecimal("100000"), 1L))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Bạn đã dùng hết");
    }
}
