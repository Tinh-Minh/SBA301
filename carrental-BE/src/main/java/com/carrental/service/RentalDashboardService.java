package com.carrental.service;

import com.carrental.dto.booking.BookingDtos.*;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.CarImage;
import com.carrental.entity.Customer;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.HandoverStatus;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSafetyRecordRepository;
import com.carrental.repository.HandoverRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.TransactionRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Bảng theo dõi: chủ xe (từng xe + tổng) và khách hàng. */
@Service
@RequiredArgsConstructor
public class RentalDashboardService {

    private static final Set<BookingStatus> CLOSED_BAD =
            EnumSet.of(BookingStatus.CANCELLED, BookingStatus.REJECTED, BookingStatus.EXPIRED);

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final ReviewRepository reviewRepository;
    private final TransactionRepository transactionRepository;
    private final HandoverRepository handoverRepository;
    private final CarSafetyRecordRepository safetyRecordRepository;
    private final CarDocumentRepository carDocumentRepository;
    private final CarSafetyService carSafetyService;
    private final CurrentUserService currentUserService;
    private final Clock clock;

    @Transactional(readOnly = true)
    public OwnerDashboardResponse owner() {
        Customer owner = currentUserService.getCurrentUser();
        CurrentUserService.requireVerifiedOwner(owner);
        LocalDateTime now = LocalDateTime.now(clock);
        List<Car> cars = carRepository.findAllByOwnerIdOrderByIdAsc(owner.getId());
        List<Booking> bookings = bookingRepository.findAllByOwnerIdOrderByPickupAtDesc(owner.getId());
        Map<Long, BigDecimal> spend = new HashMap<>();
        for (Object[] row : transactionRepository.sumPackageSpendByCar(owner.getId())) {
            spend.put(((Number) row[0]).longValue(), (BigDecimal) row[1]);
        }

        List<CarStat> stats = new ArrayList<>();
        for (Car car : cars) {
            List<Booking> mine = bookings.stream().filter(b -> b.getCar().getId().equals(car.getId())).toList();
            Double avg = reviewRepository.getAverageRatingByCarId(car.getId());
            long reviews = reviewRepository.findByCarIdOrderByCreatedAtDesc(car.getId()).size();
            String level = carSafetyService.summarize(car,
                    safetyRecordRepository.findAllByCarIdOrderByPerformedAtDescIdDesc(car.getId()),
                    carDocumentRepository.findAllByCarId(car.getId()), true).level().name();
            LocalDateTime next = mine.stream().filter(b -> b.getStatus().holdsCar() && b.getPickupAt().isAfter(now))
                    .map(Booking::getPickupAt).min(Comparator.naturalOrder()).orElse(null);
            stats.add(new CarStat(car.getId(), (car.getBrand() + " " + car.getModel()).trim(), car.getLicensePlate(),
                    image(car.getId()), car.getStatus().name(), car.getListingStatus().name(), level,
                    mine.size(), count(mine, b -> b.getStatus() == BookingStatus.REQUESTED),
                    count(mine, b -> b.getStatus().holdsCar()), count(mine, b -> b.getStatus() == BookingStatus.COMPLETED),
                    count(mine, b -> CLOSED_BAD.contains(b.getStatus())),
                    revenue(mine), upcoming(mine), spend.getOrDefault(car.getId(), BigDecimal.ZERO), hours(mine),
                    avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0, reviews, next,
                    mine.stream().limit(5).map(bookingService::toResponse).toList()));
        }
        BigDecimal totalRevenue = revenue(bookings);
        BigDecimal totalSpend = spend.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);
        List<BookingResponse> action = bookings.stream().filter(b -> ownerMustAct(b))
                .sorted(Comparator.comparing(Booking::getPickupAt)).map(bookingService::toResponse).toList();
        return new OwnerDashboardResponse(cars.size(),
                cars.stream().filter(c -> c.getStatus().name().equals("ACTIVE") || c.getStatus().name().equals("INACTIVE")).count(),
                cars.stream().filter(c -> c.getListingStatus().name().equals("LISTED")).count(),
                count(bookings, b -> b.getStatus() == BookingStatus.REQUESTED),
                count(bookings, b -> b.getStatus().holdsCar()),
                count(bookings, b -> b.getStatus() == BookingStatus.COMPLETED),
                totalRevenue, upcoming(bookings), totalSpend, totalRevenue.subtract(totalSpend),
                monthly(bookings, now), stats, action);
    }

    @Transactional(readOnly = true)
    public CustomerDashboardResponse customer() {
        Customer me = currentUserService.getCurrentUser();
        LocalDateTime now = LocalDateTime.now(clock);
        List<Booking> bookings = bookingRepository.findAllByCustomerIdOrderByPickupAtDesc(me.getId());
        BigDecimal deposits = bookings.stream().filter(b -> b.getStatus() == BookingStatus.IN_PROGRESS
                        || b.getStatus() == BookingStatus.RETURN_PENDING)
                .map(Booking::getDepositAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        List<BookingResponse> action = bookings.stream().filter(this::customerMustAct)
                .map(bookingService::toResponse).toList();
        return new CustomerDashboardResponse(bookings.size(),
                count(bookings, b -> (b.getStatus() == BookingStatus.REQUESTED || b.getStatus() == BookingStatus.CONFIRMED)
                        && b.getPickupAt().isAfter(now)),
                count(bookings, b -> b.getStatus() == BookingStatus.PICKUP_PENDING || b.getStatus() == BookingStatus.IN_PROGRESS
                        || b.getStatus() == BookingStatus.RETURN_PENDING),
                count(bookings, b -> b.getStatus() == BookingStatus.COMPLETED),
                count(bookings, b -> CLOSED_BAD.contains(b.getStatus())),
                revenue(bookings), deposits, hours(bookings), monthly(bookings, now), action,
                bookings.stream().map(bookingService::toResponse).toList());
    }

    // ------------------------------------------------------------------ helpers

    private boolean ownerMustAct(Booking b) {
        if (b.getStatus() == BookingStatus.REQUESTED || b.getStatus() == BookingStatus.CONFIRMED) return true;
        if (b.getStatus() == BookingStatus.IN_PROGRESS) return true;
        return (b.getStatus() == BookingStatus.PICKUP_PENDING || b.getStatus() == BookingStatus.RETURN_PENDING)
                && handoverRepository.findAllByBookingIdOrderByIdAsc(b.getId()).stream()
                .anyMatch(h -> h.getStatus() == HandoverStatus.DISPUTED);
    }

    private boolean customerMustAct(Booking b) {
        return (b.getStatus() == BookingStatus.PICKUP_PENDING || b.getStatus() == BookingStatus.RETURN_PENDING)
                && handoverRepository.findAllByBookingIdOrderByIdAsc(b.getId()).stream()
                .anyMatch(h -> h.getStatus() == HandoverStatus.SUBMITTED);
    }

    private static long count(List<Booking> list, Predicate<Booking> p) {
        return list.stream().filter(p).count();
    }

    /**
     * Doanh thu của chủ xe cho một đơn hoàn tất: tiền thuê GỐC + phí phát sinh.
     * Khoản giảm giá voucher do nền tảng chịu (bù cho chủ xe), không trừ vào doanh thu chủ xe.
     */
    static BigDecimal ownerEarning(Booking b) {
        return nz(b.getRentalAmount()).add(nz(b.getExtraKmAmount())).add(nz(b.getLateAmount())).add(nz(b.getOtherFeeAmount()));
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    /** Doanh thu thực = đơn hoàn tất (tính cả phí phát sinh). */
    private static BigDecimal revenue(List<Booking> list) {
        return list.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .map(RentalDashboardService::ownerEarning)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static BigDecimal upcoming(List<Booking> list) {
        return list.stream().filter(b -> b.getStatus().holdsCar()).map(Booking::getRentalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private static long hours(List<Booking> list) {
        return list.stream().filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .mapToLong(b -> Duration.between(b.getPickupAt(), b.getReturnAt()).toHours()).sum();
    }

    private static List<MonthlyPoint> monthly(List<Booking> list, LocalDateTime now) {
        Map<YearMonth, BigDecimal[]> map = new LinkedHashMap<>();
        YearMonth current = YearMonth.from(now);
        for (int i = 5; i >= 0; i--) map.put(current.minusMonths(i), new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
        for (Booking b : list) {
            if (b.getStatus() != BookingStatus.COMPLETED) continue;
            BigDecimal[] slot = map.get(YearMonth.from(b.getPickupAt()));
            if (slot == null) continue;
            slot[0] = slot[0].add(ownerEarning(b));
            slot[1] = slot[1].add(BigDecimal.ONE);
        }
        List<MonthlyPoint> out = new ArrayList<>();
        map.forEach((k, v) -> out.add(new MonthlyPoint(k.getMonthValue() + "/" + k.getYear(), v[0], v[1].longValue())));
        return out;
    }

    private String image(Long carId) {
        return carImageRepository.findByCarIdAndIsPrimaryTrue(carId).map(CarImage::getImageUrl).orElse(null);
    }
}

