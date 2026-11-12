package com.carrental.scheduling;

import com.carrental.service.BookingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingExpirationSchedulerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingExpirationScheduler scheduler;

    @Test
    void expireStaleRequestsCallsService() {
        when(bookingService.expireStaleRequests()).thenReturn(2);

        scheduler.expireStaleRequests();

        verify(bookingService).expireStaleRequests();
    }

    @Test
    void exceptionDuringExpirationIsHandledGracefully() {
        when(bookingService.expireStaleRequests()).thenThrow(new RuntimeException("Database connection timeout"));

        scheduler.expireStaleRequests();

        verify(bookingService).expireStaleRequests();
    }
}
