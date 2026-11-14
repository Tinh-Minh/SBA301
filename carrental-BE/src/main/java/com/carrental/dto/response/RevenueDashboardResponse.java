package com.carrental.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record RevenueDashboardResponse(
        BigDecimal totalRevenue,
        long activeListingsCount,
        long totalPackagesSold,
        String bestSellingPackageName,
        List<PackageSalesStat> packageStats,
        List<TransactionResponse> recentTransactions
) {}

