package com.carrental.service;

import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;

import com.carrental.dto.response.RevenueDashboardResponse;

public interface DashboardService {
    RevenueDashboardResponse getRevenueDashboard();

    AdminBookingStats admin();
}
