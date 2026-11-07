package com.carrental.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** Cấu hình gói đăng tin (Function 3), đọc từ các khóa app.subscription.* trong application.properties. */
@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.subscription")
public class SubscriptionProperties {

    /** Chủ xe có bao nhiêu phút để thanh toán; quá hạn thì gói PENDING_PAYMENT bị huỷ. */
    private long paymentTimeoutMinutes = 30;
}
