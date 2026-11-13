package com.carrental.scheduling;

import com.carrental.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Mỗi phút (giây 15): quét giao dịch PENDING quá hạn thanh toán → chuyển sang FAILED,
 * huỷ gói đăng tin PENDING_PAYMENT liên quan nếu có.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionExpirationScheduler {

    private final TransactionService transactionService;

    @Scheduled(cron = "1 * * * * *")
    public void expireStaleTransactions() {
        try {
            int n = transactionService.expirePendingTransactions();
            if (n > 0) {
                log.info("Đã hủy {} giao dịch PENDING quá hạn thanh toán", n);
            }
        } catch (RuntimeException e) {
            log.warn("Lỗi khi xử lý giao dịch quá hạn: {}", e.getMessage());
        }
    }
}

