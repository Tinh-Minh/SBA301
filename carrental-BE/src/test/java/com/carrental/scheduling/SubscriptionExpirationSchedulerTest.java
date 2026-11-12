package com.carrental.scheduling;

import com.carrental.exception.AppException;
import com.carrental.service.CarSubscriptionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SubscriptionExpirationSchedulerTest {

    @Mock
    private CarSubscriptionService subscriptionService;

    @InjectMocks
    private SubscriptionExpirationScheduler scheduler;

    @Test
    void oneFailingSubscriptionDoesNotStopTheBatch() {
        when(subscriptionService.findExpiredSubscriptionIds()).thenReturn(List.of(1L, 2L, 3L));
        when(subscriptionService.findOverduePendingIds()).thenReturn(List.of());
        when(subscriptionService.expireSubscription(1L)).thenReturn(true);
        when(subscriptionService.expireSubscription(2L))
                .thenThrow(new ObjectOptimisticLockingFailureException("Car", 2L));
        when(subscriptionService.expireSubscription(3L)).thenReturn(true);

        scheduler.scanAndExpireSubscriptions();

        verify(subscriptionService).expireSubscription(3L);
    }

    @Test
    void overduePendingIsCancelledEvenIfOneFails() {
        when(subscriptionService.findExpiredSubscriptionIds()).thenReturn(List.of());
        when(subscriptionService.findOverduePendingIds()).thenReturn(List.of(7L, 8L));
        when(subscriptionService.cancelOverduePending(7L))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đăng tin (id=7)"));
        when(subscriptionService.cancelOverduePending(8L)).thenReturn(true);

        scheduler.scanAndExpireSubscriptions();

        verify(subscriptionService).cancelOverduePending(8L);
    }

    @Test
    void nothingOverdueDoesNothing() {
        when(subscriptionService.findExpiredSubscriptionIds()).thenReturn(List.of());
        when(subscriptionService.findOverduePendingIds()).thenReturn(List.of());

        scheduler.scanAndExpireSubscriptions();

        verify(subscriptionService, never()).expireSubscription(anyLong());
        verify(subscriptionService, never()).cancelOverduePending(anyLong());
    }
}
