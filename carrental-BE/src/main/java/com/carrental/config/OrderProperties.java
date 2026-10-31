package com.carrental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/** Cấu hình nghiệp vụ đơn thuê (Function 3), đọc từ các khóa app.order.* trong application.properties. */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.order")
public class OrderProperties {

    /** Chủ xe có bao nhiêu phút để xác nhận đơn (không vượt quá giờ nhận xe). */
    private long confirmTimeoutMinutes = 1440;

    /** Người thuê có bao nhiêu phút để thanh toán sau khi chủ xe xác nhận (không vượt quá giờ nhận xe). */
    private long paymentTimeoutMinutes = 30;

    /** % hoa hồng nền tảng chụp vào đơn lúc tạo. */
    private BigDecimal commissionRate = new BigDecimal("10.00");

    /** Cho phép nhận xe sớm hơn giờ đặt bao nhiêu phút. */
    private long pickupEarlyMinutes = 60;

    /**
     * Bắt buộc đơn đã thanh toán (payment_status = PAID) mới được lập biên bản nhận xe, và đơn CONFIRMED
     * quá hạn thanh toán bị huỷ. Tắt thì người thuê nhận xe không cần trả tiền và chủ xe vẫn được chi trả.
     */
    private boolean requirePaymentBeforePickup = true;
}
