package com.carrental.event;

import com.carrental.entity.ExtraFee;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Transaction;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.TransactionType;
import com.carrental.repository.ExtraFeeRepository;
import com.carrental.repository.RentalOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentEventListener {

    private final RentalOrderRepository rentalOrderRepository;
    private final ExtraFeeRepository extraFeeRepository;

    @EventListener
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        Transaction transaction = event.transaction();
        if (transaction == null) return;

        log.info("Xử lý PaymentCompletedEvent cho transaction id={}, type={}",
                transaction.getId(), transaction.getTransactionType());

        RentalOrder order = transaction.getOrder();
        if (order != null) {
            if (transaction.getTransactionType() == TransactionType.RENTAL_PAYMENT) {
                if (order.getPaymentStatus() != PaymentStatus.PAID) {
                    order.setPaymentStatus(PaymentStatus.PAID);
                    rentalOrderRepository.save(order);
                    log.info("Cập nhật order id={} sang trạng thái PAID", order.getId());
                }
            }
        }

        if (transaction.getExtraFee() != null || transaction.getTransactionType() == TransactionType.EXTRA_FEE) {
            ExtraFee extraFee = transaction.getExtraFee();
            if (extraFee != null && extraFee.getStatus() != ExtraFeeStatus.PAID) {
                extraFee.setStatus(ExtraFeeStatus.PAID);
                extraFeeRepository.save(extraFee);
                log.info("Cập nhật extraFee id={} sang trạng thái PAID", extraFee.getId());
            }
        }
    }
}
