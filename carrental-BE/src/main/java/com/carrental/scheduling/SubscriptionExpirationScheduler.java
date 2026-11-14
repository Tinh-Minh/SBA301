package com.carrental.scheduling;

import com.carrental.service.CarSubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Predicate;

/**
 * Mỗi phút dọn gói quá hạn: gói ACTIVE qua end_date sang EXPIRED (tạm ẩn tin),
 * gói PENDING_PAYMENT quá hạn thanh toán sang CANCELLED.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionExpirationScheduler {

    private final CarSubscriptionService subscriptionService;

    @Scheduled(cron = "0 * * * * *")
    public void scanAndExpireSubscriptions() {
        int expired = processEach(subscriptionService.findExpiredSubscriptionIds(),
                subscriptionService::expireSubscription, "chuyển sang EXPIRED");
        if (expired > 0) {
            log.info("Đã chuyển {} gói đăng tin hết hạn sang EXPIRED", expired);
        }
        int cancelled = processEach(subscriptionService.findOverduePendingIds(),
                subscriptionService::cancelOverduePending, "huỷ do quá hạn thanh toán");
        if (cancelled > 0) {
            log.info("Đã huỷ {} gói đăng tin quá hạn thanh toán", cancelled);
        }
    }

    private int processEach(List<Long> ids, Predicate<Long> action, String actionName) {
        int done = 0;
        for (Long id : ids) {
            // Mỗi gói một transaction riêng: một gói lỗi không làm hỏng cả lô; gói đó được xét lại ở lần chạy sau.
            try {
                if (action.test(id)) {
                    done++;
                }
            } catch (RuntimeException ex) {
                log.warn("Không thể {} gói {}: {}", actionName, id, ex.getMessage());
            }
        }
        return done;
    }
}
