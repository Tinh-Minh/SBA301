package com.carrental.entity;

import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.Transmission;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "cars")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Car extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Customer owner;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(name = "brand", nullable = false, length = 50)
    private String brand;

    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @Column(name = "manufacture_year", nullable = false)
    private Integer manufactureYear;

    @Enumerated(EnumType.STRING)
    @Column(name = "car_type", nullable = false, length = 20)
    private CarType carType;

    @Column(name = "seats", nullable = false)
    private Integer seats;

    @Enumerated(EnumType.STRING)
    @Column(name = "transmission", nullable = false, length = 20)
    private Transmission transmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false, length = 20)
    private FuelType fuelType;

    @Column(name = "color", length = 30)
    private String color;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "features", nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private String features = "[]";

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "pickup_address", nullable = false, length = 300)
    private String pickupAddress;

    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;

    // Giá tham khảo theo ngày / tháng cho tin đăng
    @Column(name = "rental_price_per_day", precision = 14, scale = 0)
    private BigDecimal rentalPricePerDay;

    @Column(name = "rental_price_per_month", precision = 14, scale = 0)
    private BigDecimal rentalPricePerMonth;

    // Thông tin liên hệ công khai trên tin đăng
    @Column(name = "contact_name", length = 150)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_zalo", length = 20)
    private String contactZalo;

    // Trạng thái kiểm duyệt hồ sơ xe bởi Admin
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private CarStatus status = CarStatus.PENDING_APPROVAL;

    // Trạng thái hiển thị rao vặt (được cấp bởi gói subscription)
    @Enumerated(EnumType.STRING)
    @Column(name = "listing_status", nullable = false, length = 20)
    @Builder.Default
    private ListingStatus listingStatus = ListingStatus.UNLISTED;

    // Gói subscription đang áp dụng gần nhất
    @Column(name = "current_subscription_id")
    private Long currentSubscriptionId;
}
