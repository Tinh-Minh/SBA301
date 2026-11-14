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

public record BookingResponse(
        Long id,
        String bookingCode,
        BookingStatus status,
        Long carId,
        String carName,
        String carLicensePlate,
        String carImageUrl,
        String pickupAddress,
        Long customerId,
        String customerName,
        String customerPhone,
        Long ownerId,
        String ownerName,
        String ownerPhone,
        LocalDateTime pickupAt,
        LocalDateTime returnAt,
        Integer rentalDays,
        Integer rentalHours,
        BigDecimal pricePerDay,
        BigDecimal pricePerHour,
        BigDecimal dayAmount,
        BigDecimal hourAmount,
        BigDecimal rentalAmount,
        BigDecimal depositAmount,
        Integer kmLimitPerDay,
        BigDecimal extraKmFee,
        BigDecimal lateFeePerHour,
        String customerNote,
        LocalDateTime ownerContactedAt,
        String contactNote,
        LocalDateTime confirmedAt,
        String rejectReason,
        String cancelReason,
        String cancelledBy,
        LocalDateTime pickedUpAt,
        LocalDateTime returnedAt,
        Integer pickupOdometerKm,
        Integer returnOdometerKm,
        BigDecimal extraKmAmount,
        BigDecimal lateAmount,
        BigDecimal otherFeeAmount,
        String otherFeeNote,
        BigDecimal finalAmount,
        LocalDateTime completedAt,
        LocalDateTime createdAt,
        boolean reviewed,
        List<HandoverResponse> handovers,
        String voucherCode,
        BigDecimal discountAmount,
        PaymentStatus depositStatus,
        BigDecimal remainingAmount,
        LocalDateTime returnReportedAt,
        LocalDateTime depositPaidAt,
        LocalDateTime depositDueAt,
        LocalDateTime ownerResponseDueAt,
        PaymentStatus rentalPaymentStatus,
        BigDecimal rentalRemainingAmount,
        PaymentStatus extraFeeStatus,
        BigDecimal fuelFeeAmount,
        LocalDateTime cancelledAt,
        BigDecimal cancelFeeAmount,
        BigDecimal refundAmount) {

    public static BookingResponse from(Booking b, String imageUrl, boolean reviewed, List<Handover> handovers) {
        var car = b.getCar();
        // Số điện thoại hai bên chỉ hiện khi đơn còn hiệu lực (đã gửi yêu cầu trở đi), không lộ ra đơn bị từ chối.
        boolean sharePhones = b.getStatus() != BookingStatus.REJECTED && b.getStatus() != BookingStatus.EXPIRED;
        String vCode = b.getVoucher() != null ? b.getVoucher().getCode() : null;
        BigDecimal discount = b.getDiscountAmount() != null ? b.getDiscountAmount() : BigDecimal.ZERO;
        PaymentStatus depStatus = b.getDepositStatus() != null ? b.getDepositStatus() : PaymentStatus.UNPAID;
        BigDecimal rem = b.getFinalAmount();
        return new BookingResponse(
                b.getId(), b.getBookingCode(), b.getStatus(),
                car.getId(), (car.getBrand() + " " + car.getModel()).trim(), car.getLicensePlate(), imageUrl,
                car.getPickupAddress(),
                b.getCustomer().getId(), b.getCustomer().getFullName(),
                sharePhones ? (b.getContactPhone() != null ? b.getContactPhone() : b.getCustomer().getPhone()) : null,
                b.getOwner().getId(), b.getOwner().getFullName(),
                sharePhones ? (car.getContactPhone() != null ? car.getContactPhone() : b.getOwner().getPhone()) : null,
                b.getPickupAt(), b.getReturnAt(), b.getRentalDays(), b.getRentalHours(),
                b.getPricePerDay(), b.getPricePerHour(), b.getDayAmount(), b.getHourAmount(), b.getRentalAmount(),
                b.getDepositAmount(), b.getKmLimitPerDay(), b.getExtraKmFee(), b.getLateFeePerHour(),
                b.getCustomerNote(), b.getOwnerContactedAt(), b.getContactNote(), b.getConfirmedAt(),
                b.getRejectReason(), b.getCancelReason(), b.getCancelledBy(), b.getPickedUpAt(), b.getReturnedAt(),
                b.getPickupOdometerKm(), b.getReturnOdometerKm(), b.getExtraKmAmount(), b.getLateAmount(),
                b.getOtherFeeAmount(), b.getOtherFeeNote(), b.getFinalAmount(), b.getCompletedAt(), b.getCreatedAt(),
                reviewed, handovers.stream().map(HandoverResponse::from).toList(),
                vCode, discount, depStatus, rem, b.getReturnReportedAt(),
                b.getDepositPaidAt(),
                b.getCreatedAt() != null ? b.getCreatedAt().plus(com.carrental.util.BookingMoneyPolicy.DEPOSIT_PAYMENT_WINDOW) : null,
                b.getDepositPaidAt() != null ? b.getDepositPaidAt().plus(com.carrental.util.BookingMoneyPolicy.OWNER_RESPONSE_WINDOW) : null,
                b.getRentalPaymentStatus(),
                b.getRentalAmount().subtract(discount).max(BigDecimal.ZERO)
                        .subtract(b.getDepositAmount() != null ? b.getDepositAmount() : BigDecimal.ZERO).max(BigDecimal.ZERO),
                b.getExtraFeeStatus(), b.getFuelFeeAmount(), b.getCancelledAt(), b.getCancelFeeAmount(), b.getRefundAmount());
    }
}
