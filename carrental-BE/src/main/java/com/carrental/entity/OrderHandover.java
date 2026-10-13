package com.carrental.entity;

import com.carrental.enums.HandoverType;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/** Biên bản bàn giao xe: PICKUP (nhận xe) hoặc RETURN (trả xe). */
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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "handover", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HandoverImage> images = new ArrayList<>();

    public void addImage(HandoverImage image) {
        image.setHandover(this);
        images.add(image);
    }

    /** Biên bản chỉ có hiệu lực khi cả người thuê và chủ xe đều đã xác nhận. */
    public boolean isFullyConfirmed() {
        return renterConfirmedAt != null && ownerConfirmedAt != null;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        if (createdAt == null) createdAt = now;
        if (handedAt == null) handedAt = now;
    }
}
