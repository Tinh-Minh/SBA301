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
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private RentalOrder order;

    @ManyToOne(fetch = FetchType.LAZY)
    private Transaction transactions;

    @ManyToOne(fetch = FetchType.LAZY)
    private Dispute disputes;

    @ManyToOne(fetch = FetchType.LAZY)
    private ExtraFee extraFees;

    @Size(max = 20)
    @NotNull
    @Column(name = "transaction_type", nullable = false, length = 20)
    private String transactionType;

    @NotNull
    @Column(name = "amount", nullable = false, precision = 14)
    private BigDecimal amount;

    @Size(max = 20)
    @NotNull
    @Column(name = "method", nullable = false, length = 20)
    private String method;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'PENDING'")
    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Size(max = 100)
    @Column(name = "provider_ref", length = 100)
    private String providerRef;

    @Column(name = "paid_at")
    private Instant paidAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


}