package com.carrental.entity;

import com.carrental.enums.RentalOption;
import com.carrental.enums.SlotStatus;
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
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * TẠM THỜI cho Function 3 - chủ sở hữu thật là Function 2.
 * Function 3 chỉ đọc giá, hình thức thuê, số giờ tối thiểu và trạng thái của slot.
 * Khi Function 2 merge entity CarSlot đầy đủ, xóa file này.
 */
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "price_per_hour", nullable = false, precision = 14)
    private BigDecimal pricePerHour;

    @Column(name = "price_per_day", nullable = false, precision = 14)
    private BigDecimal pricePerDay;

    @Enumerated(EnumType.STRING)
    @Column(name = "rental_option", nullable = false, length = 10)
    private RentalOption rentalOption;

    @Column(name = "min_rental_hours", nullable = false)
    private Integer minRentalHours;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SlotStatus status;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;
}
