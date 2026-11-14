package com.carrental.scheduling;

import com.carrental.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Mỗi phút: yêu cầu thuê chưa được chủ xe nhận khi đã tới giờ nhận xe chuyển sang EXPIRED. */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingExpirationScheduler {

    private final BookingService bookingService;

    @Scheduled(cron = "30 * * * * *")
    public void expireStaleRequests() {
        try {
            int n = bookingService.expireStaleRequests();
            if (n > 0) log.info("Đã chuyển {} yêu cầu thuê quá hạn sang EXPIRED", n);
            int c = bookingService.cancelUnpaidDeposits();
            if (c > 0) log.info("Đã huỷ {} đơn quá hạn đặt cọc", c);
        } catch (RuntimeException e) {
            log.warn("Không thể xử lý yêu cầu thuê quá hạn: {}", e.getMessage());
        }
    }
}
