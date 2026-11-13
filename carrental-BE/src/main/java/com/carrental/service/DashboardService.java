package com.carrental.service;

import com.carrental.dto.booking.BookingDtos.AdminBookingStats;
import com.carrental.dto.response.RevenueDashboardResponse;

public interface DashboardService {
    RevenueDashboardResponse getRevenueDashboard();

    AdminBookingStats admin();
}
