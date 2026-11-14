package com.carrental.service.impl;

import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;

import com.carrental.dto.response.PackageSalesStat;
import com.carrental.dto.response.RevenueDashboardResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.ListingPackage;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.HandoverStatus;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.HandoverRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.DashboardService;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.*;
import java.util.function.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class DashboardServiceImpl implements DashboardService {

    private static final Set<BookingStatus> CLOSED_BAD =
            EnumSet.of(BookingStatus.CANCELLED, BookingStatus.REJECTED, BookingStatus.EXPIRED);

    private final TransactionRepository transactionRepository;
    private final CarRepository carRepository;
    private final ListingPackageRepository listingPackageRepository;
    private final BookingRepository bookingRepository;
    private final HandoverRepository handoverRepository;
    private final Clock clock;

    @Autowired
    public DashboardServiceImpl(
            TransactionRepository transactionRepository,
            CarRepository carRepository,
            ListingPackageRepository listingPackageRepository,
            BookingRepository bookingRepository,
            HandoverRepository handoverRepository,
            Clock clock) {
        this.transactionRepository = transactionRepository;
        this.carRepository = carRepository;
        this.listingPackageRepository = listingPackageRepository;
        this.bookingRepository = bookingRepository;
        this.handoverRepository = handoverRepository;
        this.clock = clock;
    }

    public DashboardServiceImpl(
            TransactionRepository transactionRepository,
            CarRepository carRepository,
            ListingPackageRepository listingPackageRepository) {
        this(transactionRepository, carRepository, listingPackageRepository,
                null, null, Clock.systemDefaultZone());
    }

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

    @Override
    @Transactional(readOnly = true)
    public AdminBookingStats admin() {
        List<Booking> all = bookingRepository.findAll();
        long disputed = handoverRepository.findAll().stream().filter(h -> h.getStatus() == HandoverStatus.DISPUTED).count();
        return new AdminBookingStats(all.size(), count(all, b -> b.getStatus() == BookingStatus.REQUESTED),
                count(all, b -> b.getStatus() == BookingStatus.CONFIRMED),
                count(all, b -> b.getStatus() == BookingStatus.PICKUP_PENDING || b.getStatus() == BookingStatus.IN_PROGRESS
                        || b.getStatus() == BookingStatus.RETURN_PENDING),
                count(all, b -> b.getStatus() == BookingStatus.COMPLETED),
                count(all, b -> CLOSED_BAD.contains(b.getStatus())), disputed, revenue(all),
                all.stream().map(b -> b.getCreatedAt().toLocalDate()).min(Comparator.naturalOrder()).orElse(LocalDate.now(clock)));
    }

    private static long count(List<Booking> list, Predicate<Booking> p) {
        return list.stream().filter(p).count();
    }

    /** Doanh thu thực = tổng giá trị đơn hoàn tất (tiền thuê sau giảm giá + phí phát sinh). */
    private static BigDecimal revenue(List<Booking> list) {
        return list.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(DashboardServiceImpl::completedTripValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal completedTripValue(Booking b) {
        BigDecimal rental = b.getRentalAmount() != null ? b.getRentalAmount() : BigDecimal.ZERO;
        BigDecimal discount = b.getDiscountAmount() != null ? b.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal extraKm = b.getExtraKmAmount() != null ? b.getExtraKmAmount() : BigDecimal.ZERO;
        BigDecimal late = b.getLateAmount() != null ? b.getLateAmount() : BigDecimal.ZERO;
        BigDecimal other = b.getOtherFeeAmount() != null ? b.getOtherFeeAmount() : BigDecimal.ZERO;
        return rental.subtract(discount).max(BigDecimal.ZERO).add(extraKm).add(late).add(other);
    }
}
