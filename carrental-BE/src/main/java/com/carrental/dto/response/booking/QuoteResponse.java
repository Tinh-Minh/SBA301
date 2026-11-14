package com.carrental.dto.response.booking;

import com.carrental.entity.Booking;
import com.carrental.entity.Handover;
import com.carrental.entity.HandoverItem;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.HandoverCategory;
import com.carrental.enums.HandoverItemStatus;
import com.carrental.enums.HandoverStatus;
import com.carrental.enums.HandoverType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.carrental.dto.request.booking.*;

public record QuoteResponse(
        Long carId,
        LocalDateTime pickupAt,
        LocalDateTime returnAt,
        long totalHours,
        int rentalDays,
        int rentalHours,
        BigDecimal pricePerDay,
        BigDecimal weekendPricePerDay,
        BigDecimal pricePerHour,
        BigDecimal dayAmount,
        BigDecimal hourAmount,
        BigDecimal rentalAmount,
        BigDecimal depositAmount,
        Integer kmLimitPerDay,
        Integer includedKm,
        BigDecimal extraKmFee,
        BigDecimal lateFeePerHour,
        boolean available,
        String unavailableReason,
        List<String> breakdown,
        String voucherCode,
        BigDecimal discountAmount,
        BigDecimal payableRentalAmount,
        BigDecimal deliveryDistanceKm,
        BigDecimal deliveryFee) {

    public QuoteResponse(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, long totalHours,
            int rentalDays, int rentalHours, BigDecimal pricePerDay, BigDecimal weekendPricePerDay,
            BigDecimal pricePerHour, BigDecimal dayAmount, BigDecimal hourAmount, BigDecimal rentalAmount,
            BigDecimal depositAmount, Integer kmLimitPerDay, Integer includedKm, BigDecimal extraKmFee,
            BigDecimal lateFeePerHour, boolean available, String unavailableReason, List<String> breakdown,
            String voucherCode, BigDecimal discountAmount, BigDecimal payableRentalAmount) {
        this(carId, pickupAt, returnAt, totalHours, rentalDays, rentalHours, pricePerDay, weekendPricePerDay,
                pricePerHour, dayAmount, hourAmount, rentalAmount, depositAmount, kmLimitPerDay, includedKm,
                extraKmFee, lateFeePerHour, available, unavailableReason, breakdown, voucherCode, discountAmount,
                payableRentalAmount, null, BigDecimal.ZERO);
    }

    /** Bản báo giá kèm phí giao xe; cọc 40% tính lại trên (tiền thuê sau giảm + phí giao). */
    public QuoteResponse withDelivery(BigDecimal distanceKm, BigDecimal fee, BigDecimal newDeposit, List<String> newBreakdown) {
        return new QuoteResponse(carId, pickupAt, returnAt, totalHours, rentalDays, rentalHours, pricePerDay,
                weekendPricePerDay, pricePerHour, dayAmount, hourAmount, rentalAmount, newDeposit, kmLimitPerDay,
                includedKm, extraKmFee, lateFeePerHour, available, unavailableReason, newBreakdown, voucherCode,
                discountAmount, payableRentalAmount, distanceKm, fee);
    }

    public QuoteResponse(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, long totalHours,
            int rentalDays, int rentalHours, BigDecimal pricePerDay, BigDecimal weekendPricePerDay,
            BigDecimal pricePerHour, BigDecimal dayAmount, BigDecimal hourAmount, BigDecimal rentalAmount,
            BigDecimal depositAmount, Integer kmLimitPerDay, Integer includedKm, BigDecimal extraKmFee,
            BigDecimal lateFeePerHour, boolean available, String unavailableReason, List<String> breakdown) {
        this(carId, pickupAt, returnAt, totalHours, rentalDays, rentalHours, pricePerDay, weekendPricePerDay,
                pricePerHour, dayAmount, hourAmount, rentalAmount, depositAmount, kmLimitPerDay, includedKm,
                extraKmFee, lateFeePerHour, available, unavailableReason, breakdown, null, BigDecimal.ZERO, rentalAmount);
    }
}
