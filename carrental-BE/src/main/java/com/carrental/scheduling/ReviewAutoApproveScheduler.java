package com.carrental.scheduling;

import com.carrental.repository.CustomerReviewRepository;
import com.carrental.repository.ReviewRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Đánh giá chờ duyệt quá {@link #AUTO_APPROVE_HOURS} giờ sẽ tự được duyệt và hiển thị công khai. */
@Slf4j
@Component
@RequiredArgsConstructor
public class ReviewAutoApproveScheduler {

    public static final int AUTO_APPROVE_HOURS = 48;

    private final ReviewRepository reviewRepository;
    private final CustomerReviewRepository customerReviewRepository;

    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void autoApprove() {
        try {
            LocalDateTime cutoff = LocalDateTime.now().minusHours(AUTO_APPROVE_HOURS);
            int n = reviewRepository.approveCreatedBefore(cutoff);
            int m = customerReviewRepository.approveCreatedBefore(cutoff);
            if (n + m > 0) log.info("Tự duyệt {} đánh giá xe và {} đánh giá khách thuê đã chờ quá {} giờ", n, m, AUTO_APPROVE_HOURS);
        } catch (RuntimeException e) {
            log.warn("Không thể tự duyệt đánh giá: {}", e.getMessage());
        }
    }
}
