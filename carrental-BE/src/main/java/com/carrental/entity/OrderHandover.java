package com.carrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;

@Getter
@Setter
@Entity
@Table(name = "order_handovers")
public class OrderHandover {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "order_id", nullable = false)
    private RentalOrder order;

    @Size(max = 10)
    @NotNull
    @Column(name = "handover_type", nullable = false, length = 10)
    private String handoverType;

    @Column(name = "odometer_km")
    private Integer odometerKm;

    @Column(name = "fuel_percent")
    private Integer fuelPercent;

    @Column(name = "condition_note", length = Integer.MAX_VALUE)
    private String conditionNote;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "handed_at", nullable = false)
    private Instant handedAt;

    @Column(name = "renter_confirmed_at")
    private Instant renterConfirmedAt;

    @Column(name = "owner_confirmed_at")
    private Instant ownerConfirmedAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;


}