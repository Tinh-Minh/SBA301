package com.carrental.scheduling;

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

    @Scheduled(cron = "0 15 * * * *")
    @Transactional
    public void autoApprove() {
        try {
            int n = reviewRepository.approveCreatedBefore(LocalDateTime.now().minusHours(AUTO_APPROVE_HOURS));
            if (n > 0) log.info("Tự duyệt {} đánh giá đã chờ quá {} giờ", n, AUTO_APPROVE_HOURS);
        } catch (RuntimeException e) {
            log.warn("Không thể tự duyệt đánh giá: {}", e.getMessage());
        }
    }
}
