package com.carrental.entity;

import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.RentalType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;

/**
 * Đơn thuê xe. Quy ước tiền:
 * rental_amount = unit_price * quantity; total_amount = rental_amount - discount_amount;
 * deposit_amount thu riêng và hoàn khi trả xe.
 */
@Entity
@Table(name = "rental_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 30)
    private String orderCode;

    /** Người thuê. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_slot_id", nullable = false)
    private CarSlot carSlot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Enumerated(EnumType.STRING)
    @Column(name = "rental_type", nullable = false, length = 10)
    private RentalType rentalType;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @Column(name = "unit_price", nullable = false, precision = 14)
    private BigDecimal unitPrice;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "rental_amount", nullable = false, precision = 14)
    private BigDecimal rentalAmount;

    @Column(name = "discount_amount", nullable = false, precision = 14)
    private BigDecimal discountAmount;

    @Column(name = "total_amount", nullable = false, precision = 14)
    private BigDecimal totalAmount;

    @Column(name = "deposit_amount", nullable = false, precision = 14)
    private BigDecimal depositAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private OrderStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    private PaymentStatus paymentStatus;

    /** Hạn chủ xe phải xác nhận đơn PENDING, quá hạn hệ thống chuyển EXPIRED. */
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    private Customer cancelledBy;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "commission_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal commissionRate;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (createdAt == null) createdAt = now;
        updatedAt = now;
        if (status == null) status = OrderStatus.PENDING;
        if (paymentStatus == null) paymentStatus = PaymentStatus.UNPAID;
        if (discountAmount == null) discountAmount = BigDecimal.ZERO;
        if (depositAmount == null) depositAmount = BigDecimal.ZERO;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
    }
}
