package com.carrental.service.impl;

import com.carrental.dto.response.PriceQuoteDTO;
import com.carrental.entity.CarSlot;
import com.carrental.entity.Voucher;
import com.carrental.enums.CarStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.RentalOption;
import com.carrental.enums.RentalType;
import com.carrental.enums.SlotStatus;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.PricingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.Set;

@Service
public class PricingServiceImpl implements PricingService {

    private static final long SECONDS_PER_HOUR = 3600;
    private static final long SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    /** Đơn ở các trạng thái này không còn chiếm lượt dùng voucher. */
    public static final Set<OrderStatus> VOUCHER_RELEASED_STATUSES =
            EnumSet.of(OrderStatus.REJECTED, OrderStatus.EXPIRED, OrderStatus.CANCELLED);

    private final VoucherRepository voucherRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final Clock clock;

    public PricingServiceImpl(VoucherRepository voucherRepository,
                              RentalOrderRepository rentalOrderRepository,
                              Clock clock) {
        this.voucherRepository = voucherRepository;
        this.rentalOrderRepository = rentalOrderRepository;
        this.clock = clock;
    }

    @Override
    public PriceQuoteDTO quote(CarSlot slot, RentalType rentalType, LocalDateTime startTime, LocalDateTime endTime,
                               String voucherCode, Long customerId) {
        validateBookingWindow(slot, rentalType, startTime, endTime);

        BigDecimal unitPrice = rentalType == RentalType.HOURLY ? slot.getPricePerHour() : slot.getPricePerDay();
        int quantity = calculateQuantity(rentalType, startTime, endTime);
        BigDecimal rentalAmount = unitPrice.multiply(BigDecimal.valueOf(quantity));

        Voucher voucher = resolveVoucher(voucherCode, rentalAmount, customerId);
        BigDecimal discount = voucher == null ? BigDecimal.ZERO : calculateDiscount(voucher, rentalAmount);
        BigDecimal deposit = slot.getCar().getDepositAmount() == null
                ? BigDecimal.ZERO : slot.getCar().getDepositAmount();

        return PriceQuoteDTO.builder()
                .carSlotId(slot.getId())
                .rentalType(rentalType)
                .startTime(startTime)
                .endTime(endTime)
                .unitPrice(unitPrice)
                .quantity(quantity)
                .rentalAmount(rentalAmount)
                .discountAmount(discount)
                .totalAmount(rentalAmount.subtract(discount))
                .depositAmount(deposit)
                .voucherId(voucher == null ? null : voucher.getId())
                .voucherCode(voucher == null ? null : voucher.getCode())
                .build();
    }

    @Override
    public void validateBookingWindow(CarSlot slot, RentalType rentalType,
                                      LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null || !endTime.isAfter(startTime)) {
            throw new BadRequestException("Giờ trả xe phải sau giờ nhận xe");
        }
        if (startTime.isBefore(LocalDateTime.now(clock))) {
            throw new BadRequestException("Không thể đặt xe cho thời điểm trong quá khứ");
        }
        if (slot.getStatus() != SlotStatus.OPEN) {
            throw new BadRequestException("Slot không còn mở để đặt");
        }
        if (slot.getCar() == null || slot.getCar().getStatus() != CarStatus.ACTIVE) {
            throw new BadRequestException("Xe hiện không cho thuê");
        }
        if (startTime.isBefore(slot.getStartTime()) || endTime.isAfter(slot.getEndTime())) {
            throw new BadRequestException("Thời gian thuê phải nằm trong slot ("
                    + slot.getStartTime() + " - " + slot.getEndTime() + ")");
        }
        if (rentalType == RentalType.HOURLY && slot.getRentalOption() == RentalOption.DAILY) {
            throw new BadRequestException("Slot này chỉ cho thuê theo ngày");
        }
        if (rentalType == RentalType.DAILY && slot.getRentalOption() == RentalOption.HOURLY) {
            throw new BadRequestException("Slot này chỉ cho thuê theo giờ");
        }
        if (rentalType == RentalType.HOURLY) {
            long seconds = Duration.between(startTime, endTime).getSeconds();
            int minHours = slot.getMinRentalHours() == null ? 1 : slot.getMinRentalHours();
            if (seconds < minHours * SECONDS_PER_HOUR) {
                throw new BadRequestException("Thời gian thuê tối thiểu của slot là " + minHours + " giờ");
            }
        }
    }

    @Override
    public int calculateQuantity(RentalType rentalType, LocalDateTime startTime, LocalDateTime endTime) {
        long seconds = Duration.between(startTime, endTime).getSeconds();
        if (seconds <= 0) {
            throw new BadRequestException("Giờ trả xe phải sau giờ nhận xe");
        }
        long unit = rentalType == RentalType.HOURLY ? SECONDS_PER_HOUR : SECONDS_PER_DAY;
        return Math.toIntExact((seconds + unit - 1) / unit);
    }

    @Override
    public BigDecimal calculateDiscount(Voucher voucher, BigDecimal rentalAmount) {
        BigDecimal discount;
        if (voucher.getDiscountType() == DiscountType.PERCENT) {
            discount = rentalAmount.multiply(voucher.getDiscountValue())
                    .divide(HUNDRED, 0, RoundingMode.DOWN);
            if (voucher.getMaxDiscount() != null && discount.compareTo(voucher.getMaxDiscount()) > 0) {
                discount = voucher.getMaxDiscount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }
        return discount.min(rentalAmount);
    }

    @Override
    public Voucher resolveVoucher(String voucherCode, BigDecimal rentalAmount, Long customerId) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return null;
        }
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim())
                .orElseThrow(() -> new BadRequestException("Mã voucher không tồn tại"));

        LocalDateTime now = LocalDateTime.now(clock);
        if (voucher.getStatus() != VoucherStatus.ACTIVE
                || now.isBefore(voucher.getStartAt()) || !now.isBefore(voucher.getEndAt())) {
            throw new BadRequestException("Voucher đã hết hạn hoặc chưa đến thời gian sử dụng");
        }
        if (rentalAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new BadRequestException("Đơn chưa đạt giá trị tối thiểu "
                    + voucher.getMinOrderAmount().toPlainString() + "đ để dùng voucher");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new BadRequestException("Voucher đã hết lượt sử dụng");
        }
        if (customerId != null) {
            long used = rentalOrderRepository.countVoucherUsage(
                    voucher.getId(), customerId, VOUCHER_RELEASED_STATUSES);
            if (used >= voucher.getPerUserLimit()) {
                throw new BadRequestException("Bạn đã dùng hết lượt của voucher này");
            }
        }
        return voucher;
    }
}
