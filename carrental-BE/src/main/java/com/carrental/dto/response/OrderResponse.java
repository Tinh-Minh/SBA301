package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.RentalType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Thông tin một đơn thuê trả về cho client. */
public record OrderResponse(
        Long id,
        String orderCode,
        Long customerId,
        String customerName,
        Long carId,
        String carName,
        String licensePlate,
        Long ownerId,
        String ownerName,
        Long carSlotId,
        Long voucherId,
        String voucherCode,
        RentalType rentalType,
        LocalDateTime startTime,
        LocalDateTime endTime,
        LocalDateTime actualStartTime,
        LocalDateTime actualEndTime,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal rentalAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        BigDecimal depositAmount,
        BigDecimal commissionRate,
        OrderStatus status,
        PaymentStatus paymentStatus,
        LocalDateTime expiresAt,
        LocalDateTime confirmedAt,
        LocalDateTime cancelledAt,
        Long cancelledById,
        String cancelReason,
        String note,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

    /** Gọi trong service (còn transaction); các quan hệ đã được nạp sẵn bằng @EntityGraph. */
    public static OrderResponse from(RentalOrder o) {
        Car car = o.getCar();
        return new OrderResponse(
                o.getId(),
                o.getOrderCode(),
                o.getCustomer().getId(),
                o.getCustomer().getFullName(),
                car.getId(),
                car.getBrand() + " " + car.getModel(),
                car.getLicensePlate(),
                car.getOwner().getId(),
                car.getOwner().getFullName(),
                o.getCarSlot().getId(),
                o.getVoucher() == null ? null : o.getVoucher().getId(),
                o.getVoucher() == null ? null : o.getVoucher().getCode(),
                o.getRentalType(),
                o.getStartTime(),
                o.getEndTime(),
                o.getActualStartTime(),
                o.getActualEndTime(),
                o.getUnitPrice(),
                o.getQuantity(),
                o.getRentalAmount(),
                o.getDiscountAmount(),
                o.getTotalAmount(),
                o.getDepositAmount(),
                o.getCommissionRate(),
                o.getStatus(),
                o.getPaymentStatus(),
                o.getExpiresAt(),
                o.getConfirmedAt(),
                o.getCancelledAt(),
                o.getCancelledBy() == null ? null : o.getCancelledBy().getId(),
                o.getCancelReason(),
                o.getNote(),
                o.getCreatedAt(),
                o.getUpdatedAt());
    }
}
