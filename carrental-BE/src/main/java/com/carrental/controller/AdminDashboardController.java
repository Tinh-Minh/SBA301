package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.RevenueDashboardResponse;
import com.carrental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final DashboardService dashboardService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/revenue")
    public ApiResponse<RevenueDashboardResponse> getRevenueDashboard() {
        return ApiResponse.ok("Lấy báo cáo doanh thu thành công", dashboardService.getRevenueDashboard());
    }
}

