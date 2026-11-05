package com.carrental.scheduling;

import com.carrental.entity.Car;
import com.carrental.entity.CarSubscription;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionExpirationScheduler {

    private final CarSubscriptionRepository carSubscriptionRepository;
    private final CarRepository carRepository;

    /**
     * Quét và xử lý các gói tin đăng đã hết hạn mỗi 60 giây.
     */
    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void expireSubscriptions() {
        LocalDateTime now = TimeUtil.nowVn();
        List<CarSubscription> expiredSubs = carSubscriptionRepository.findByStatusAndEndDateBefore(SubscriptionStatus.ACTIVE, now);

        if (expiredSubs.isEmpty()) {
            return;
        }

        log.info("Tìm thấy {} gói đăng tin đã hết hạn cần xử lý", expiredSubs.size());

        for (CarSubscription sub : expiredSubs) {
            sub.setStatus(SubscriptionStatus.EXPIRED);
            carSubscriptionRepository.save(sub);

            Car car = sub.getCar();
            if (car != null) {
                // Kiểm tra xem xe này có gói nào khác còn ACTIVE không
                boolean hasOtherActiveSub = carSubscriptionRepository.existsByCarIdAndStatus(car.getId(), SubscriptionStatus.ACTIVE);
                if (!hasOtherActiveSub) {
                    car.setListingStatus(ListingStatus.EXPIRED);
                    carRepository.save(car);
                    log.info("Chuyển trạng thái tin đăng xe carId={} sang EXPIRED do gói đăng ký id={} hết hạn", car.getId(), sub.getId());
                }
            }
        }
    }
}
