package com.carrental.service.impl;

import com.carrental.dto.response.PackageSalesStat;
import com.carrental.dto.response.RevenueDashboardResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.ListingPackage;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.repository.CarRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final CarRepository carRepository;
    private final ListingPackageRepository listingPackageRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueDashboardResponse getRevenueDashboard() {
        BigDecimal totalRevenue = transactionRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        long activeListings = carRepository.countByListingStatus(ListingStatus.LISTED);
        long totalSold = transactionRepository.countByStatusAndTransactionType(TransactionStatus.SUCCESS, TransactionType.PACKAGE_PAYMENT);

        List<ListingPackage> allPackages = listingPackageRepository.findAll();
        Map<Long, PackageSalesStat> statMap = new LinkedHashMap<>();
        for (ListingPackage lp : allPackages) {
            statMap.put(lp.getId(), new PackageSalesStat(lp.getId(), lp.getName(), lp.getCode(), 0L, BigDecimal.ZERO));
        }

        List<Object[]> rows = transactionRepository.findPackageRevenueStats();
        String bestSellingPackageName = "Chưa có";
        long maxCount = -1;

        for (Object[] r : rows) {
            Long pkgId = ((Number) r[0]).longValue();
            String name = (String) r[1];
            String code = (String) r[2];
            long count = ((Number) r[3]).longValue();
            BigDecimal amount = (BigDecimal) r[4];

            statMap.put(pkgId, new PackageSalesStat(pkgId, name, code, count, amount));

            if (count > maxCount) {
                maxCount = count;
                bestSellingPackageName = name;
            }
        }

        List<PackageSalesStat> packageStats = new ArrayList<>(statMap.values());

        List<TransactionResponse> recentTransactions = transactionRepository
                .findTop10ByStatusOrderByCreatedAtDesc(TransactionStatus.SUCCESS)
                .stream()
                .map(TransactionResponse::from)
                .toList();

        return new RevenueDashboardResponse(
                totalRevenue,
                activeListings,
                totalSold,
                bestSellingPackageName,
                packageStats,
                recentTransactions
        );
    }
}

