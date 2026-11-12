package com.carrental.entity;

import com.carrental.enums.HandoverStatus;
import com.carrental.enums.HandoverType;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

/** Biên bản bàn giao (nhận xe / trả xe) do chủ xe lập, khách xác nhận từng mục. */
@Entity
@Table(name = "handovers", uniqueConstraints = @UniqueConstraint(columnNames = {"booking_id", "handover_type"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Handover extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Enumerated(EnumType.STRING)
    @Column(name = "handover_type", nullable = false, length = 10)
    private HandoverType handoverType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private HandoverStatus status = HandoverStatus.SUBMITTED;

    @Column(name = "odometer_km", nullable = false)
    private Integer odometerKm;

    /** Mức nhiên liệu / pin (%). */
    @Column(name = "fuel_percent", nullable = false)
    private Integer fuelPercent;

    @Column(name = "owner_note", length = 1000)
    private String ownerNote;

    @Column(name = "customer_note", length = 1000)
    private String customerNote;

    @Column(name = "revision", nullable = false)
    @Builder.Default
    private Integer revision = 1;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;

    @OneToMany(mappedBy = "handover", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC, id ASC")
    @Builder.Default
    private List<HandoverItem> items = new ArrayList<>();
}
