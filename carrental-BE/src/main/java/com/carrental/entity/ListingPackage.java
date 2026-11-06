package com.carrental.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "listing_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ListingPackage extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "price", nullable = false, precision = 14, scale = 0)
    private BigDecimal price;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "priority_level", nullable = false)
    @Builder.Default
    private Integer priorityLevel = 1;

    @Column(name = "badge_label", nullable = false, length = 50)
    @Builder.Default
    private String badgeLabel = "THƯỜNG";

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

