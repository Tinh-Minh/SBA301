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
        // 1. Quét các đơn PENDING quá hạn chủ xe xác nhận -> EXPIRED
        List<Long> pendingIds = rentalOrderService.findOverduePendingOrderIds();
        int expired = 0;
        for (Long id : pendingIds) {
            try {
                if (rentalOrderService.expireOrder(id)) {
                    expired++;
                }
            } catch (RuntimeException ex) {
                log.warn("Không thể chuyển đơn {} sang EXPIRED: {}", id, ex.getMessage());
            }
        }
        if (expired > 0) {
            log.info("Đã chuyển {} đơn PENDING quá hạn xác nhận sang EXPIRED", expired);
        }

        // 2. Quét các đơn CONFIRMED quá hạn thanh toán -> CANCELLED
        List<Long> paymentOverdueIds = rentalOrderService.findOverduePaymentOrderIds();
        int cancelled = 0;
        for (Long id : paymentOverdueIds) {
            try {
                if (rentalOrderService.cancelOverduePaymentOrder(id)) {
                    cancelled++;
                }
            } catch (RuntimeException ex) {
                log.warn("Không thể huỷ đơn {} do quá hạn thanh toán: {}", id, ex.getMessage());
            }
        }
        if (cancelled > 0) {
            log.info("Đã tự động huỷ {} đơn CONFIRMED quá hạn thanh toán sang CANCELLED", cancelled);
        }
    }
}
