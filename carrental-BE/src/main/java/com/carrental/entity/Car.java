package com.carrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Entity
@Table(name = "cars")
public class Car {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private Customer owner;

    @OneToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @Size(max = 20)
    @NotNull
    @Column(name = "license_plate", nullable = false, length = 20)
    private String licensePlate;

    @Size(max = 50)
    @NotNull
    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Size(max = 50)
    @NotNull
    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @NotNull
    @Column(name = "manufacture_year", nullable = false)
    private Integer manufactureYear;

    @Size(max = 20)
    @NotNull
    @Column(name = "car_type", nullable = false, length = 20)
    private String carType;

    @NotNull
    @Column(name = "seats", nullable = false)
    private Integer seats;

    @Size(max = 20)
    @NotNull
    @Column(name = "transmission", nullable = false, length = 20)
    private String transmission;

    @Size(max = 20)
    @NotNull
    @Column(name = "fuel_type", nullable = false, length = 20)
    private String fuelType;

    @Size(max = 30)
    @Column(name = "color", length = 30)
    private String color;

    @Column(name = "description", length = Integer.MAX_VALUE)
    private String description;

    @NotNull
    @ColumnDefault("'[]'")
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features", nullable = false)
    private Map<String, Object> features;

    @Size(max = 100)
    @NotNull
    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Size(max = 100)
    @Column(name = "district", length = 100)
    private String district;

    @Size(max = 300)
    @NotNull
    @Column(name = "pickup_address", nullable = false, length = 300)
    private String pickupAddress;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    @NotNull
    @Column(name = "price_per_hour", nullable = false, precision = 14)
    private BigDecimal pricePerHour;

    @NotNull
    @Column(name = "price_per_day", nullable = false, precision = 14)
    private BigDecimal pricePerDay;

    @NotNull
    @ColumnDefault("0")
    @Column(name = "deposit_amount", nullable = false, precision = 14)
    private BigDecimal depositAmount;

    @Column(name = "km_limit_per_day")
    private Integer kmLimitPerDay;

    @Column(name = "extra_km_fee", precision = 14)
    private BigDecimal extraKmFee;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'PENDING_APPROVAL'")
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