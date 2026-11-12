package com.carrental.dto.request;

import com.carrental.entity.Car;
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
@com.fasterxml.jackson.annotation.JsonIgnoreProperties(ignoreUnknown = true)
public class CarUpdateRequest {

    @NotBlank(message = "Hãng xe không được để trống")
    @Size(max = 50, message = "Hãng xe tối đa 50 ký tự")
    private String brand;

    @NotBlank(message = "Dòng xe (model) không được để trống")
    @Size(max = 50, message = "Dòng xe tối đa 50 ký tự")
    private String model;

    @NotNull(message = "Năm sản xuất không được để trống")
    @Min(value = 1990, message = "Năm sản xuất từ 1990 trở lên")
    @Max(value = 2027, message = "Năm sản xuất không hợp lệ")
    private Integer manufactureYear;

    @NotNull(message = "Loại xe không được để trống")
    private CarType carType;

    @NotNull(message = "Số ghế không được để trống")
    @Min(value = 2, message = "Số ghế tối thiểu là 2")
    @Max(value = 60, message = "Số ghế tối đa là 60")
    private Integer seats;

    @NotNull(message = "Hộp số không được để trống")
    private Transmission transmission;

    @NotNull(message = "Loại nhiên liệu không được để trống")
    private FuelType fuelType;

    @Size(max = 30, message = "Màu xe tối đa 30 ký tự")
    private String color;

    private String description;
    private String features;

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

    // Giá tham khảo ngày / tháng
    @DecimalMin(value = "0", message = "Giá thuê theo ngày phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo ngày không có số lẻ")
    private BigDecimal rentalPricePerDay;

    @DecimalMin(value = "0", message = "Giá thuê theo tháng phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo tháng không có số lẻ")
    private BigDecimal rentalPricePerMonth;

    // Thông tin liên hệ
    @Size(max = 150, message = "Tên liên hệ tối đa 150 ký tự")
    private String contactName;

    @Size(max = 20, message = "Số điện thoại liên hệ tối đa 20 ký tự")
    private String contactPhone;

    @Size(max = 20, message = "Số Zalo liên hệ tối đa 20 ký tự")
    private String contactZalo;

    @DecimalMin(value = "0", message = "Giá thuê theo ngày phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá thuê theo ngày không có số lẻ")
    private BigDecimal pricePerDay;

    // Điều khoản thuê do chủ xe niêm yết
    @DecimalMin(value = "0", message = "Giá cuối tuần phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Giá cuối tuần không có số lẻ")
    private BigDecimal weekendPricePerDay;

    @DecimalMin(value = "0", message = "Tiền cọc phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Tiền cọc không có số lẻ")
    private BigDecimal depositAmount;

    @Min(value = 10, message = "Giới hạn km/ngày tối thiểu là 10")
    @Max(value = 5000, message = "Giới hạn km/ngày tối đa là 5000")
    private Integer kmLimitPerDay;

    @DecimalMin(value = "0", message = "Phí quá km phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Phí quá km không có số lẻ")
    private BigDecimal extraKmFee;

    @DecimalMin(value = "0", message = "Phí trễ giờ phải >= 0")
    @Digits(integer = 14, fraction = 0, message = "Phí trễ giờ không có số lẻ")
    private BigDecimal lateFeePerHour;

    public void applyTo(Car car) {
        car.setBrand(this.brand);
        car.setModel(this.model);
        car.setManufactureYear(this.manufactureYear);
        car.setCarType(this.carType);
        car.setSeats(this.seats);
        car.setTransmission(this.transmission);
        car.setFuelType(this.fuelType);
        car.setColor(this.color);
        car.setDescription(this.description);
        if (this.features != null) {
            car.setFeatures(this.features);
        }
        car.setCity(this.city);
        car.setDistrict(this.district);
        car.setPickupAddress(this.pickupAddress);
        car.setLatitude(this.latitude);
        car.setLongitude(this.longitude);

        if (this.rentalPricePerDay != null) {
            car.setRentalPricePerDay(this.rentalPricePerDay);
        } else if (this.pricePerDay != null) {
            car.setRentalPricePerDay(this.pricePerDay);
        }
        if (this.rentalPricePerMonth != null) {
            car.setRentalPricePerMonth(this.rentalPricePerMonth);
        }
        // Điều khoản thuê: chỉ ghi đè khi client gửi lên (giữ nguyên giá trị cũ nếu bỏ trống)
        if (this.weekendPricePerDay != null) {
            car.setWeekendPricePerDay(this.weekendPricePerDay);
        }
        if (this.depositAmount != null) {
            car.setDepositAmount(this.depositAmount);
        }
        if (this.kmLimitPerDay != null) {
            car.setKmLimitPerDay(this.kmLimitPerDay);
        }
        if (this.extraKmFee != null) {
            car.setExtraKmFee(this.extraKmFee);
        }
        if (this.lateFeePerHour != null) {
            car.setLateFeePerHour(this.lateFeePerHour);
        }
        if (this.contactName != null) {
            car.setContactName(this.contactName);
        }
        if (this.contactPhone != null) {
            car.setContactPhone(this.contactPhone);
        }
        if (this.contactZalo != null) {
            car.setContactZalo(this.contactZalo);
        }
    }
}
