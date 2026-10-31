package com.carrental.scheduling;

import com.carrental.service.RentalOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

/**
 * Định kỳ dọn đơn quá hạn: PENDING quá hạn chủ xe xác nhận sang EXPIRED,
 * CONFIRMED quá hạn thanh toán sang CANCELLED (để trả lại lịch xe).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderExpirationScheduler {

    private final RentalOrderService rentalOrderService;

    @Scheduled(fixedDelayString = "${app.order.expire-check-ms:60000}",
            initialDelayString = "${app.order.expire-initial-delay-ms:30000}")
    public void expireOverdueOrders() {
        int expired = processEach(rentalOrderService.findOverduePendingOrderIds(),
                rentalOrderService::expireOrder, "chuyển sang EXPIRED");
        if (expired > 0) {
            log.info("Đã chuyển {} đơn quá hạn sang EXPIRED", expired);
        }
        int cancelled = processEach(rentalOrderService.findOverduePaymentOrderIds(),
                rentalOrderService::cancelOverduePaymentOrder, "huỷ do quá hạn thanh toán");
        if (cancelled > 0) {
            log.info("Đã huỷ {} đơn quá hạn thanh toán", cancelled);
        }
    }

    private int processEach(List<Long> ids, Predicate<Long> action, String actionName) {
        int done = 0;
        for (Long id : ids) {
            // Mỗi đơn một transaction riêng: một đơn lỗi (vd. chủ xe vừa xác nhận, người thuê vừa
            // thanh toán đúng lúc) không làm hỏng cả lô; đơn đó được xét lại ở lần chạy sau.
            try {
                if (action.test(id)) {
                    done++;
                }
            } catch (RuntimeException ex) {
                log.warn("Không thể {} đơn {}: {}", actionName, id, ex.getMessage());
            }
        }
        return done;
    }
}
