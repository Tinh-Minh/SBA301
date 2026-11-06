package com.carrental.dto.response;

import java.math.BigDecimal;

public record PackageSalesStat(
        Long packageId,
        String packageName,
        String packageCode,
        long countSold,
        BigDecimal totalRevenue
) {}

