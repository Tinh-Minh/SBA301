package com.carrental.dto.response;

import com.carrental.entity.Car;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.RentalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponseDTO {

    private Long id;
    private String orderCode;

    private Long customerId;
    private String customerName;

    private Long carId;
    private String carName;
    private String licensePlate;
    private Long ownerId;
    private String ownerName;

    private Long carSlotId;
    private Long voucherId;
    private String voucherCode;

    private RentalType rentalType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;

    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal rentalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private BigDecimal commissionRate;

    private OrderStatus status;
    private PaymentStatus paymentStatus;
    private LocalDateTime expiresAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime cancelledAt;
    private Long cancelledById;
    private String cancelReason;
    private String note;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static OrderResponseDTO fromEntity(RentalOrder o) {
        Car car = o.getCar();
        return OrderResponseDTO.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .customerId(o.getCustomer().getId())
                .customerName(o.getCustomer().getFullName())
                .carId(car.getId())
                .carName(car.getBrand() + " " + car.getModel())
                .licensePlate(car.getLicensePlate())
                .ownerId(car.getOwner().getId())
                .ownerName(car.getOwner().getFullName())
                .carSlotId(o.getCarSlot().getId())
                .voucherId(o.getVoucher() == null ? null : o.getVoucher().getId())
                .voucherCode(o.getVoucher() == null ? null : o.getVoucher().getCode())
                .rentalType(o.getRentalType())
                .startTime(o.getStartTime())
                .endTime(o.getEndTime())
                .actualStartTime(o.getActualStartTime())
                .actualEndTime(o.getActualEndTime())
                .unitPrice(o.getUnitPrice())
                .quantity(o.getQuantity())
                .rentalAmount(o.getRentalAmount())
                .discountAmount(o.getDiscountAmount())
                .totalAmount(o.getTotalAmount())
                .depositAmount(o.getDepositAmount())
                .commissionRate(o.getCommissionRate())
                .status(o.getStatus())
                .paymentStatus(o.getPaymentStatus())
                .expiresAt(o.getExpiresAt())
                .confirmedAt(o.getConfirmedAt())
                .cancelledAt(o.getCancelledAt())
                .cancelledById(o.getCancelledBy() == null ? null : o.getCancelledBy().getId())
                .cancelReason(o.getCancelReason())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
