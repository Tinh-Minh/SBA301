package com.carrental.dto.request;

import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.FuelType;
import com.carrental.enums.Transmission;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Locale;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarCreateRequest {

    @NotBlank(message = "Biển số xe không được để trống")
    @Size(max = 20, message = "Biển số xe tối đa 20 ký tự")
    private String licensePlate;

    @NotBlank(message = "Hãng xe không được để trống")
    @Size(max = 50, message = "Hãng xe tối đa 50 ký tự")
    private String brand;

    @NotBlank(message = "Dòng xe (model) không được để trống")
    @Size(max = 50, message = "Dòng xe tối đa 50 ký tự")
    private String model;

    @NotNull(message = "Năm sản xuất không được để trống")
    @Min(value = 1990, message = "Năm sản xuất từ 1990 trở lên")
    @Max(value = 2100, message = "Năm sản xuất không hợp lệ")
    private Integer manufactureYear;

    @NotNull(message = "Loại xe không được để trống")
    private CarType carType;

    @NotNull(message = "Số ghế không được để trống")
    @Min(value = 1, message = "Số ghế tối thiểu là 1")
    @Max(value = 60, message = "Số ghế tối đa là 60")
    private Integer seats;

    @NotNull(message = "Hộp số không được để trống")
    private Transmission transmission;

    @NotNull(message = "Loại nhiên liệu không được để trống")
    private FuelType fuelType;

    @Size(max = 30, message = "Màu xe tối đa 30 ký tự")
    private String color;

    private String description;

    @Builder.Default
    private String features = "[]";

    @NotBlank(message = "Thành phố không được để trống")
    @Size(max = 100, message = "Tên thành phố tối đa 100 ký tự")
    private String city;

    @Size(max = 100, message = "Tên quận/huyện tối đa 100 ký tự")
    private String district;

    @NotBlank(message = "Địa chỉ nhận xe không được để trống")
    @Size(max = 300, message = "Địa chỉ nhận xe tối đa 300 ký tự")
    private String pickupAddress;

    @DecimalMin(value = "-90.0", message = "Vĩ độ tối thiểu là -90")
    @DecimalMax(value = "90.0", message = "Vĩ độ tối đa là 90")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Kinh độ tối thiểu là -180")
    @DecimalMax(value = "180.0", message = "Kinh độ tối đa là 180")
    private BigDecimal longitude;

    @NotNull(message = "Giá thuê theo giờ không được để trống")
    @DecimalMin(value = "0", message = "Giá thuê theo giờ phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo giờ không có số lẻ")
    private BigDecimal pricePerHour;

    @NotNull(message = "Giá thuê theo ngày không được để trống")
    @DecimalMin(value = "0", message = "Giá thuê theo ngày phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo ngày không có số lẻ")
    private BigDecimal pricePerDay;

    @DecimalMin(value = "0", message = "Tiền cọc phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Tiền cọc không có số lẻ")
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Min(value = 1, message = "Giới hạn km mỗi ngày phải > 0")
    private Integer kmLimitPerDay;

    @DecimalMin(value = "0", message = "Phí vượt km phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Phí vượt km không có số lẻ")
    private BigDecimal extraKmFee;

    public Car toEntity() {
        return Car.builder()
                .licensePlate(this.licensePlate != null ? this.licensePlate.trim().toUpperCase(Locale.ROOT) : null)
                .brand(this.brand)
                .model(this.model)
                .manufactureYear(this.manufactureYear)
                .carType(this.carType)
                .seats(this.seats)
                .transmission(this.transmission)
                .fuelType(this.fuelType)
                .color(this.color)
                .description(this.description)
                .features(this.features != null ? this.features : "[]")
                .city(this.city)
                .district(this.district)
                .pickupAddress(this.pickupAddress)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .pricePerHour(this.pricePerHour)
                .pricePerDay(this.pricePerDay)
                .depositAmount(this.depositAmount != null ? this.depositAmount : BigDecimal.ZERO)
                .kmLimitPerDay(this.kmLimitPerDay)
                .extraKmFee(this.extraKmFee)
                .status(CarStatus.PENDING_APPROVAL)
                .build();
    }
}
