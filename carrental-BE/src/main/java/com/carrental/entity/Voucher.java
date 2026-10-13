package com.carrental.entity;

import com.carrental.enums.DiscountType;
import com.carrental.enums.VoucherStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TẠM THỜI cho Function 3 - chủ sở hữu thật là Function 1 (admin quản lý voucher).
 * Function 3 đọc điều kiện voucher để tính giảm giá và tăng/giảm used_count khi đặt/huỷ đơn.
 * Khi Function 1 merge entity Voucher đầy đủ, xóa file này.
 */
@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 10)
    private DiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 14)
    private BigDecimal discountValue;

    @Column(name = "max_discount", precision = 14)
    private BigDecimal maxDiscount;

    @Column(name = "min_order_amount", nullable = false, precision = 14)
    private BigDecimal minOrderAmount;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "per_user_limit", nullable = false)
    private Integer perUserLimit;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private VoucherStatus status;
}
