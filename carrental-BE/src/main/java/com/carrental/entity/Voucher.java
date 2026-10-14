package com.carrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "vouchers")
public class Voucher {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Size(max = 50)
    @NotNull
    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Size(max = 300)
    @Column(name = "description", length = 300)
    private String description;

    @Size(max = 10)
    @NotNull
    @Column(name = "discount_type", nullable = false, length = 10)
    private String discountType;

    @NotNull
    @Column(name = "discount_value", nullable = false, precision = 14)
    private BigDecimal discountValue;

    @Column(name = "max_discount", precision = 14)
    private BigDecimal maxDiscount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "min_order_amount", nullable = false, precision = 14)
    private BigDecimal minOrderAmount;

    @NotNull
    @Column(name = "start_at", nullable = false)
    private Instant startAt;

    @NotNull
    @Column(name = "end_at", nullable = false)
    private Instant endAt;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @NotNull
    @ColumnDefault("1")
    @Column(name = "per_user_limit", nullable = false)
    private Integer perUserLimit;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "used_count", nullable = false)
    private Integer usedCount;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'ACTIVE'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


}