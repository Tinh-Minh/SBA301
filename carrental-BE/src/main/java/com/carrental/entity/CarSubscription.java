package com.carrental.entity;

import com.carrental.enums.SubscriptionPaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "car_subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarSubscription extends BaseEntity {

    @Column(name = "subscription_code", nullable = false, unique = true, length = 50)
    private String subscriptionCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", nullable = false)
    private ListingPackage listingPackage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "package_price", nullable = false, precision = 14, scale = 0)
    private BigDecimal packagePrice;

    @Column(name = "discount_amount", nullable = false, precision = 14, scale = 0)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 14, scale = 0)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SubscriptionStatus status = SubscriptionStatus.PENDING_PAYMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private SubscriptionPaymentStatus paymentStatus = SubscriptionPaymentStatus.UNPAID;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;
}

