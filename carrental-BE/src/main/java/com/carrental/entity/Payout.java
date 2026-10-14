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
@Table(name = "payouts")
public class Payout {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private RentalOrder order;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private Customer recipient;

    @ManyToOne(fetch = FetchType.LAZY)
    private BankAccount bankAccounts;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adjustment_transaction_id")
    private Transaction adjustmentTransaction;

    @NotNull
    @Column(name = "gross_amount", nullable = false, precision = 14)
    private BigDecimal grossAmount;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "platform_fee", nullable = false, precision = 14)
    private BigDecimal platformFee;

    @NotNull
    @Column(name = "net_amount", nullable = false, precision = 14)
    private BigDecimal netAmount;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'PENDING'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Size(max = 500)
    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "paid_at")
    private Instant paidAt;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "version", nullable = false)
    private Long version;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


}