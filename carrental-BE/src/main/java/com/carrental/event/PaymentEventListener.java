package com.carrental.event;

import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Transaction;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final CarSubscriptionRepository carSubscriptionRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;

    @Async
    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        Transaction transaction = event.transaction();
        if (transaction == null) {
            return;
        }

        log.info("Xử lý PaymentCompletedEvent cho transaction id={}, type={}",
                transaction.getId(), transaction.getTransactionType());

        if (transaction.getTransactionType() == TransactionType.PACKAGE_PAYMENT) {
            CarSubscription subscription = transaction.getSubscription();
            if (subscription != null && subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                LocalDateTime now = TimeUtil.nowVn();
                var pkg = subscription.getListingPackage();
                int totalSlots = (pkg != null && pkg.getSlotCount() != null) ? pkg.getSlotCount() : 1;
                int slotDays = (pkg != null && pkg.getDurationDaysPerSlot() != null) ? pkg.getDurationDaysPerSlot() : 7;
                int durationDays = (pkg != null && pkg.getDurationDays() != null) ? pkg.getDurationDays() : (totalSlots * slotDays);

                subscription.setPaymentStatus(PaymentStatus.PAID);
                subscription.setStatus(SubscriptionStatus.ACTIVE);
                subscription.setTotalSlots(totalSlots);
                subscription.setRemainingSlots(Math.max(0, totalSlots - 1));
                subscription.setDurationDaysPerSlot(slotDays);
                subscription.setCurrentSlotStartDate(now);
                subscription.setCurrentSlotEndDate(now.plusDays(slotDays));
                subscription.setStartDate(now);
                subscription.setEndDate(now.plusDays(durationDays));
                subscription.setActivatedAt(now);
                carSubscriptionRepository.save(subscription);
                log.info("Kích hoạt gói thành công cho subscriptionId={}, hiệu lực slot đến {}, còn {} slot",
                        subscription.getId(), subscription.getCurrentSlotEndDate(), subscription.getRemainingSlots());

                Car car = subscription.getCar();
                if (car != null) {
                    car.setCurrentSubscriptionId(subscription.getId());
                    car.setListingStatus(ListingStatus.LISTED);
                    carRepository.save(car);
                    log.info("Chuyển trạng thái xe carId={} sang LISTED", car.getId());
                }
            }
        }
        // Thanh toán của đơn thuê được BookingService.applyPayment xử lý đồng bộ trong VNPayServiceImpl.
    }
}
