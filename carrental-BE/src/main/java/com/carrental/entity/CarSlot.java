package com.carrental.entity;

import com.carrental.enums.RentalOption;
import com.carrental.enums.SlotStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "car_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "price_per_hour", nullable = false, precision = 14, scale = 0)
    private BigDecimal pricePerHour;

    @Column(name = "price_per_day", nullable = false, precision = 14, scale = 0)
    private BigDecimal pricePerDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "rental_option", nullable = false, length = 10)
    @Builder.Default
    private RentalOption rentalOption = RentalOption.BOTH;

    @Column(name = "min_rental_hours", nullable = false)
    @Builder.Default
    private Integer minRentalHours = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SlotStatus status = SlotStatus.OPEN;

    @Version
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Long version = 0L;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
