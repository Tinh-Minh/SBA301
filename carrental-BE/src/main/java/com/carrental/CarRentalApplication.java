package com.carrental;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CarRentalApplication {

    public static void main(String[] args) {
        // Mọi LocalDateTime (createdAt của Hibernate, LocalDateTime.now()) và Clock của app phải cùng múi giờ VN.
        // Trên máy chủ chạy UTC, createdAt bị lệch 7 giờ so với Clock nên gói chờ thanh toán bị huỷ sai thời điểm.
        java.util.TimeZone.setDefault(java.util.TimeZone.getTimeZone(
                System.getenv().getOrDefault("APP_TIME_ZONE", "Asia/Ho_Chi_Minh")));
        SpringApplication.run(CarRentalApplication.class, args);
    }
}
