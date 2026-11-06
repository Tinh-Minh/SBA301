package com.carrental.event;

import com.carrental.entity.Car;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Transaction;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.SubscriptionPaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final CarSubscriptionRepository carSubscriptionRepository;
    private final CarRepository carRepository;

    @EventListener
    @Transactional
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        Transaction transaction = event.transaction();
        if (transaction == null) return;

        log.info("Xử lý PaymentCompletedEvent cho transaction id={}, type={}",
                transaction.getId(), transaction.getTransactionType());

        CarSubscription subscription = transaction.getSubscription();
        if (subscription != null) {
            LocalDateTime now = TimeUtil.nowVn();
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setPaymentStatus(SubscriptionPaymentStatus.PAID);
            subscription.setActivatedAt(now);
            subscription.setStartDate(now);

            int durationDays = 30;
            if (subscription.getListingPackage() != null && subscription.getListingPackage().getDurationDays() != null) {
                durationDays = subscription.getListingPackage().getDurationDays();
            }
            subscription.setEndDate(now.plusDays(durationDays));
            carSubscriptionRepository.save(subscription);

            Car car = subscription.getCar();
            if (car != null) {
                car.setCurrentSubscriptionId(subscription.getId());
                car.setListingStatus(ListingStatus.LISTED);
                carRepository.save(car);
                log.info("Đã kích hoạt gói subscription id={} và cập nhật xe id={} sang LISTED",
                        subscription.getId(), car.getId());
            }
        }
    }
}
