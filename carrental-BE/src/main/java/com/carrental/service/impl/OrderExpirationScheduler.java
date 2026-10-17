package com.carrental.service.impl;

import com.carrental.service.RentalOrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/** Định kỳ chuyển các đơn PENDING quá hạn chủ xe xác nhận sang EXPIRED. */
@Component
public class OrderExpirationScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderExpirationScheduler.class);

    private final RentalOrderService rentalOrderService;

    public OrderExpirationScheduler(RentalOrderService rentalOrderService) {
        this.rentalOrderService = rentalOrderService;
    }

    @Scheduled(fixedDelayString = "${app.order.expire-check-ms:60000}",
            initialDelayString = "${app.order.expire-initial-delay-ms:30000}")
    public void expireOverdueOrders() {
        List<Long> ids = rentalOrderService.findOverduePendingOrderIds();
        int expired = 0;
        for (Long id : ids) {
            try {
                if (rentalOrderService.expireOrder(id)) {
                    expired++;
                }
            } catch (RuntimeException ex) {
                // Ví dụ chủ xe vừa xác nhận đúng lúc job chạy (optimistic lock) -> bỏ qua, lần sau xét lại.
                log.warn("Không thể chuyển đơn {} sang EXPIRED: {}", id, ex.getMessage());
            }
        }
        if (expired > 0) {
            log.info("Đã chuyển {} đơn quá hạn sang EXPIRED", expired);
        }
    }
}
