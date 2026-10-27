package com.carrental.scheduling;

import com.carrental.service.RentalOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/** Định kỳ chuyển các đơn PENDING quá hạn chủ xe xác nhận sang EXPIRED. */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpirationScheduler {

    private final RentalOrderService rentalOrderService;

    @Scheduled(fixedDelayString = "${app.order.expire-check-ms:60000}",
            initialDelayString = "${app.order.expire-initial-delay-ms:30000}")
    public void expireOverdueOrders() {
        List<Long> ids = rentalOrderService.findOverduePendingOrderIds();
        int expired = 0;
        for (Long id : ids) {
            // Mỗi đơn một transaction riêng: một đơn lỗi (vd. chủ xe vừa xác nhận đúng lúc)
            // không làm hỏng cả lô; đơn đó được xét lại ở lần chạy sau.
            try {
                if (rentalOrderService.expireOrder(id)) {
                    expired++;
                }
            } catch (RuntimeException ex) {
                log.warn("Không thể chuyển đơn {} sang EXPIRED: {}", id, ex.getMessage());
            }
        }
        if (expired > 0) {
            log.info("Đã chuyển {} đơn quá hạn sang EXPIRED", expired);
        }
    }
}
