package com.carrental.entity;

import com.carrental.enums.HandoverType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "order_handovers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderHandover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private RentalOrder order;

    @Enumerated(EnumType.STRING)
    @Column(name = "handover_type", nullable = false, length = 10)
    private HandoverType handoverType;

    @Column(name = "odometer_km")
    private Integer odometerKm;

    @Column(name = "fuel_percent")
    private Integer fuelPercent;

    @Column(name = "condition_note", columnDefinition = "TEXT")
    private String conditionNote;

    @Column(name = "handed_at", nullable = false)
    private LocalDateTime handedAt;

    @Column(name = "renter_confirmed_at")
    private LocalDateTime renterConfirmedAt;

    @Column(name = "owner_confirmed_at")
    private LocalDateTime ownerConfirmedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
