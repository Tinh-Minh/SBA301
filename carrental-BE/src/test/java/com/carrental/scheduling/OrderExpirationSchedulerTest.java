package com.carrental.scheduling;

import com.carrental.exception.AppException;
import com.carrental.service.RentalOrderService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

import java.util.List;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderExpirationSchedulerTest {

    @Mock
    private RentalOrderService rentalOrderService;

    @InjectMocks
    private OrderExpirationScheduler scheduler;

    @Test
    void oneFailingOrderDoesNotStopTheBatch() {
        when(rentalOrderService.findOverduePendingOrderIds()).thenReturn(List.of(1L, 2L, 3L));
        when(rentalOrderService.expireOrder(1L)).thenReturn(true);
        // Chủ xe vừa xác nhận đúng lúc job chạy -> lỗi sửa đồng thời
        when(rentalOrderService.expireOrder(2L))
                .thenThrow(new ObjectOptimisticLockingFailureException("RentalOrder", 2L));
        when(rentalOrderService.expireOrder(3L)).thenReturn(true);

        scheduler.expireOverdueOrders();

        verify(rentalOrderService).expireOrder(1L);
        verify(rentalOrderService).expireOrder(2L);
        verify(rentalOrderService).expireOrder(3L);
    }

    @Test
    void businessErrorOnOneOrderIsSkipped() {
        when(rentalOrderService.findOverduePendingOrderIds()).thenReturn(List.of(5L, 6L));
        when(rentalOrderService.expireOrder(5L))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Đơn thuê không tồn tại (id=5)"));
        when(rentalOrderService.expireOrder(6L)).thenReturn(false);

        scheduler.expireOverdueOrders();

        verify(rentalOrderService).expireOrder(6L);
    }

    @Test
    void noOverdueOrdersDoesNothing() {
        when(rentalOrderService.findOverduePendingOrderIds()).thenReturn(List.of());

        scheduler.expireOverdueOrders();

        verify(rentalOrderService, never()).expireOrder(org.mockito.ArgumentMatchers.anyLong());
    }
}
