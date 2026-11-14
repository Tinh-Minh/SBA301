package com.carrental.entity;

import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

/** Đơn thuê xe giữa khách và chủ xe. CarDB không thu hộ tiền thuê: hai bên thanh toán trực tiếp. */
@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Column(name = "booking_code", nullable = false, unique = true, length = 30)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Customer owner;

    @Column(name = "pickup_at", nullable = false)
    private LocalDateTime pickupAt;

    @Column(name = "return_at", nullable = false)
    private LocalDateTime returnAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.REQUESTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "discount_amount", precision = 14, scale = 0)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus depositStatus = PaymentStatus.UNPAID;

    // ----- báo giá chốt tại thời điểm đặt (giữ nguyên dù chủ xe đổi giá sau này)
    @Column(name = "rental_days", nullable = false)
    private Integer rentalDays;

    @Column(name = "rental_hours", nullable = false)
    private Integer rentalHours;

    @Column(name = "price_per_day", nullable = false, precision = 14, scale = 0)
    private BigDecimal pricePerDay;

    @Column(name = "price_per_hour", nullable = false, precision = 14, scale = 0)
    private BigDecimal pricePerHour;

    @Column(name = "day_amount", nullable = false, precision = 14, scale = 0)
    private BigDecimal dayAmount;

    @Column(name = "hour_amount", nullable = false, precision = 14, scale = 0)
    private BigDecimal hourAmount;

    @Column(name = "rental_amount", nullable = false, precision = 14, scale = 0)
    private BigDecimal rentalAmount;

    @Column(name = "deposit_amount", nullable = false, precision = 14, scale = 0)
    private BigDecimal depositAmount;

    /** Giao xe tận nơi (null = khách tự đến lấy xe tại địa chỉ của xe). */
    @Column(name = "delivery_address", length = 300)
    private String deliveryAddress;

    @Column(name = "delivery_latitude", precision = 9, scale = 6)
    private BigDecimal deliveryLatitude;

    @Column(name = "delivery_longitude", precision = 9, scale = 6)
    private BigDecimal deliveryLongitude;

    @Column(name = "delivery_distance_km", precision = 7, scale = 1)
    private BigDecimal deliveryDistanceKm;

    /** Phí giao xe, tính vào giá trị chuyến (cọc 40%, phần còn lại, phí huỷ, chi trả chủ xe). */
    @Column(name = "delivery_fee", nullable = false, precision = 14, scale = 0)
    @Builder.Default
    private BigDecimal deliveryFee = BigDecimal.ZERO;

    @Column(name = "km_limit_per_day")
    private Integer kmLimitPerDay;

    @Column(name = "extra_km_fee", precision = 14, scale = 0)
    private BigDecimal extraKmFee;

    @Column(name = "late_fee_per_hour", precision = 14, scale = 0)
    private BigDecimal lateFeePerHour;

    // ----- trao đổi
    @Column(name = "customer_note", length = 1000)
    private String customerNote;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "owner_contacted_at")
    private LocalDateTime ownerContactedAt;

    @Column(name = "contact_note", length = 1000)
    private String contactNote;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "cancelled_by", length = 20)
    private String cancelledBy;

    // ----- thực tế
    @Column(name = "picked_up_at")
    private LocalDateTime pickedUpAt;

    @Column(name = "returned_at")
    private LocalDateTime returnedAt;

    // ---------------------------------------------------------------- dòng tiền qua hệ thống
    /** Thời điểm khách thanh toán xong tiền cọc (mốc 1 giờ huỷ miễn phí, 24 giờ chủ xe phải phản hồi). */
    @Column(name = "deposit_paid_at")
    private LocalDateTime depositPaidAt;

    /** Phần tiền thuê còn lại (sau cọc) – phải thanh toán qua hệ thống trước khi nhận xe. */
    @Enumerated(EnumType.STRING)
    @Column(name = "rental_payment_status", length = 20)
    @Builder.Default
    private PaymentStatus rentalPaymentStatus = PaymentStatus.UNPAID;

    @Column(name = "rental_paid_at")
    private LocalDateTime rentalPaidAt;

    /** Phí phát sinh khi trả xe (km, trễ giờ, xăng, phí khác) – thanh toán qua hệ thống để hoàn tất chuyến. */
    @Enumerated(EnumType.STRING)
    @Column(name = "extra_fee_status", length = 20)
    @Builder.Default
    private PaymentStatus extraFeeStatus = PaymentStatus.NOT_REQUIRED;

    @Column(name = "fuel_fee_amount", precision = 14, scale = 0)
    private BigDecimal fuelFeeAmount;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    /** Phí huỷ chuyến (bên huỷ chịu) theo chính sách: miễn phí 1 giờ đầu, 10% (&gt;7 ngày), 40% (≤7 ngày). */
    @Column(name = "cancel_fee_amount", precision = 14, scale = 0)
    private BigDecimal cancelFeeAmount;

    /** Tổng tiền hoàn cho khách khi đơn bị huỷ (đã gồm đền bù nếu chủ xe huỷ). */
    @Column(name = "refund_amount", precision = 14, scale = 0)
    private BigDecimal refundAmount;

    /** Thời điểm xe thực tế được trả (khách báo hoặc lần đầu chủ xe lập biên bản trả) - dùng để tính phí trễ. */
    @Column(name = "return_reported_at")
    private LocalDateTime returnReportedAt;

    @Column(name = "pickup_odometer_km")
    private Integer pickupOdometerKm;

    @Column(name = "return_odometer_km")
    private Integer returnOdometerKm;

    @Column(name = "extra_km_amount", precision = 14, scale = 0)
    @Builder.Default
    private BigDecimal extraKmAmount = BigDecimal.ZERO;

    @Column(name = "late_amount", precision = 14, scale = 0)
    @Builder.Default
    private BigDecimal lateAmount = BigDecimal.ZERO;

    @Column(name = "other_fee_amount", precision = 14, scale = 0)
    @Builder.Default
    private BigDecimal otherFeeAmount = BigDecimal.ZERO;

    @Column(name = "other_fee_note", length = 500)
    private String otherFeeNote;

    @Column(name = "final_amount", precision = 14, scale = 0)
    private BigDecimal finalAmount;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;
}
