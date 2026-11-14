package com.carrental.service.impl;

import com.carrental.service.*;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

import com.carrental.util.BookingPricing;
import com.carrental.util.BookingMoneyPolicy;
import com.carrental.util.DeliveryPolicy;
import com.carrental.storage.PublicImageStorageService;

import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;

import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.CarImage;
import com.carrental.entity.Customer;
import com.carrental.entity.Handover;
import com.carrental.entity.HandoverItem;
import com.carrental.entity.Voucher;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.HandoverCategory;
import com.carrental.enums.HandoverItemStatus;
import com.carrental.enums.HandoverStatus;
import com.carrental.enums.HandoverType;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.Role;
import com.carrental.enums.TransactionType;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.HandoverRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.VoucherRepository;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Quy trình đặt xe: yêu cầu → chủ xe liên hệ & xác nhận → biên bản nhận xe (khách xác nhận từng mục)
 * → đang thuê → biên bản trả xe → hoàn tất.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    public static final Set<BookingStatus> HOLDING = EnumSet.of(BookingStatus.CONFIRMED,
            BookingStatus.PICKUP_PENDING, BookingStatus.IN_PROGRESS, BookingStatus.RETURN_PENDING);
    private static final Duration MIN_LEAD = Duration.ofHours(1);
    private static final int MAX_ADVANCE_DAYS = 90;
    /** Số yêu cầu thuê đang chờ chủ xe xác nhận tối đa của một khách (chống spam giữ lịch). */
    public static final int MAX_PENDING_REQUESTS = 3;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final HandoverRepository handoverRepository;
    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final ReviewRepository reviewRepository;
    private final VoucherRepository voucherRepository;
    private final CurrentUserService currentUserService;
    private final CarSafetyService carSafetyService;
    private final SettlementService settlementService;
    private final com.carrental.repository.UserDocumentRepository userDocumentRepository;
    private final PublicImageStorageService publicImageStorageService;
    private final Clock clock;

    // ================================================================== báo giá / lịch

    @Override
    @Transactional(readOnly = true)
    public QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt) {
        return quote(carId, pickupAt, returnAt, null);
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, String voucherCode) {
        return quoteBase(publicCar(carId), pickupAt, returnAt, voucherCode);
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, String voucherCode,
            BigDecimal deliveryLatitude, BigDecimal deliveryLongitude) {
        Car car = publicCar(carId);
        QuoteResponse q = quoteBase(car, pickupAt, returnAt, voucherCode);
        BigDecimal km = DeliveryPolicy.distanceKm(car.getLatitude(), car.getLongitude(), deliveryLatitude, deliveryLongitude);
        if (km == null) {
            return q;
        }
        BigDecimal fee = DeliveryPolicy.fee(km);
        BigDecimal payable = q.payableRentalAmount() != null ? q.payableRentalAmount() : q.rentalAmount();
        List<String> breakdown = new ArrayList<>(q.breakdown());
        breakdown.add("Giao xe tận nơi ~" + km.toPlainString() + " km: "
                + (fee.signum() > 0 ? BookingPricing.vnd(fee) + " (miễn phí " + DeliveryPolicy.FREE_KM + " km đầu)" : "miễn phí"));
        return q.withDelivery(km, fee, BookingMoneyPolicy.depositFor(payable.add(fee)), breakdown);
    }

    private QuoteResponse quoteBase(Car car, LocalDateTime pickupAt, LocalDateTime returnAt, String voucherCode) {
        Long carId = car.getId();
        validateWindow(pickupAt, returnAt);
        boolean free = bookingRepository.findOverlapping(carId, pickupAt, returnAt, HOLDING).isEmpty();
        QuoteResponse base = BookingPricing.quote(car, pickupAt, returnAt, free,
                free ? null : "Xe đã có lịch thuê trùng với thời gian bạn chọn");
        if (voucherCode == null || voucherCode.isBlank()) {
            return base;
        }
        Customer customer = null;
        try {
            customer = currentUserService.getCurrentUser();
        } catch (Exception ignored) {}
        Voucher voucher = resolveVoucher(voucherCode, base.rentalAmount(), customer);
        BigDecimal discount = calculateDiscount(voucher, base.rentalAmount());
        BigDecimal payable = base.rentalAmount().subtract(discount).max(BigDecimal.ZERO);
        List<String> breakdown = new ArrayList<>(base.breakdown());
        breakdown.add("Giảm giá voucher (" + voucher.getCode() + "): -" + BookingPricing.vnd(discount));
        return new QuoteResponse(
                base.carId(), base.pickupAt(), base.returnAt(), base.totalHours(),
                base.rentalDays(), base.rentalHours(), base.pricePerDay(), base.weekendPricePerDay(),
                base.pricePerHour(), base.dayAmount(), base.hourAmount(), base.rentalAmount(),
                base.depositAmount(), base.kmLimitPerDay(), base.includedKm(), base.extraKmFee(),
                base.lateFeePerHour(), base.available(), base.unavailableReason(), breakdown,
                voucher.getCode(), discount, payable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BusyRange> availability(Long carId) {
        publicCar(carId);
        return bookingRepository.findUpcomingForCar(carId, now(), HOLDING).stream()
                .map(b -> new BusyRange(b.getPickupAt(), b.getReturnAt())).toList();
    }

    /** Id các xe đã kín lịch trong khoảng thời gian (dùng cho tìm kiếm). */
    @Override
    @Transactional(readOnly = true)
    public Set<Long> busyCarIds(LocalDateTime from, LocalDateTime to) {
        return new HashSet<>(bookingRepository.findBusyCarIds(from, to, HOLDING));
    }

    @Override
    public void validateWindow(LocalDateTime pickupAt, LocalDateTime returnAt) {
        if (pickupAt == null || returnAt == null) {
            throw bad("Vui lòng chọn thời gian nhận và trả xe");
        }
        LocalDateTime now = now();
        if (pickupAt.isBefore(now.plus(MIN_LEAD).minusMinutes(1))) {
            throw bad("Thời gian nhận xe phải sau thời điểm hiện tại ít nhất 1 giờ");
        }
        if (pickupAt.isAfter(now.plusDays(MAX_ADVANCE_DAYS))) {
            throw bad("Chỉ đặt trước tối đa " + MAX_ADVANCE_DAYS + " ngày");
        }
        if (!returnAt.isAfter(pickupAt)) {
            throw bad("Thời gian trả xe phải sau thời gian nhận xe");
        }
        Duration duration = Duration.between(pickupAt, returnAt);
        if (duration.toMinutes() < BookingPricing.MIN_HOURS * 60L) {
            throw bad("Thời gian thuê tối thiểu " + BookingPricing.MIN_HOURS + " giờ");
        }
        if (duration.toDays() > BookingPricing.MAX_DAYS || duration.minusDays(BookingPricing.MAX_DAYS).isPositive()) {
            throw bad("Thời gian thuê tối đa " + BookingPricing.MAX_DAYS + " ngày, thuê dài hơn vui lòng liên hệ chủ xe");
        }
    }

    // ================================================================== khách

    @Override
    @Transactional
    public BookingResponse create(CreateBookingRequest request) {
        Customer customer = currentUserService.getCurrentUser();
        if (customer.getRole() == Role.ADMIN) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản quản trị không thể đặt xe");
        }
        Car car = carRepository.findWithOwnerById(request.carId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + request.carId()));
        if (car.getStatus() != CarStatus.ACTIVE || car.getListingStatus() != ListingStatus.LISTED
                || car.getOwner().getStatus() != com.carrental.enums.CustomerStatus.ACTIVE) {
            throw new AppException(HttpStatus.CONFLICT, "Xe hiện không nhận đặt (chưa duyệt hoặc tin đăng đã ẩn)");
        }
        if (car.getOwner().getId().equals(customer.getId())) {
            throw bad("Bạn không thể đặt xe của chính mình");
        }
        requireVerifiedDriver(customer, request.returnAt());
        BankAccountServiceImpl.requireBankAccount(customer, "để nhận tiền hoàn khi huỷ chuyến");
        if (!bookingRepository.findCustomerOverlapping(customer.getId(), request.pickupAt(), request.returnAt(), HOLDING).isEmpty()) {
            throw new AppException(HttpStatus.CONFLICT, "Bạn đã có một chuyến thuê khác trùng thời gian này");
        }
        if (bookingRepository.countByCustomerIdAndStatus(customer.getId(), BookingStatus.REQUESTED) >= MAX_PENDING_REQUESTS) {
            throw new AppException(HttpStatus.TOO_MANY_REQUESTS, "Bạn đang có " + MAX_PENDING_REQUESTS
                    + " yêu cầu thuê chờ chủ xe xác nhận. Vui lòng chờ phản hồi hoặc huỷ bớt trước khi gửi thêm");
        }
        if (carSafetyService.isUnsafe(car)) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Xe đang có đăng kiểm/bảo hiểm hết hạn hoặc không đạt nên tạm thời không nhận đặt");
        }
        validateWindow(request.pickupAt(), request.returnAt());
        // Khoá dòng xe để hai yêu cầu cùng lúc không vượt qua kiểm tra trùng lịch.
        carRepository.findWithLockById(car.getId());
        if (!bookingRepository.findOverlapping(car.getId(), request.pickupAt(), request.returnAt(), HOLDING).isEmpty()) {
            throw new AppException(HttpStatus.CONFLICT, "Xe đã có lịch thuê trùng với thời gian bạn chọn");
        }
        boolean duplicate = bookingRepository.findOverlapping(car.getId(), request.pickupAt(), request.returnAt(),
                        EnumSet.of(BookingStatus.REQUESTED)).stream()
                .anyMatch(b -> b.getCustomer().getId().equals(customer.getId()));
        if (duplicate) {
            throw new AppException(HttpStatus.CONFLICT, "Bạn đã gửi yêu cầu thuê xe này cho khoảng thời gian trùng lặp");
        }

        QuoteResponse q = BookingPricing.quote(car, request.pickupAt(), request.returnAt(), true, null);
        Voucher voucher = resolveVoucher(request.voucherCode(), q.rentalAmount(), customer);
        BigDecimal discount = calculateDiscount(voucher, q.rentalAmount());
        // Giao xe tận nơi: phí tính trên máy chủ từ toạ độ xe và điểm giao, không tin số tiền từ client.
        BigDecimal deliveryKm = DeliveryPolicy.distanceKm(car.getLatitude(), car.getLongitude(),
                request.deliveryLatitude(), request.deliveryLongitude());
        BigDecimal deliveryFee = DeliveryPolicy.fee(deliveryKm);
        // Lượt voucher chỉ bị trừ khi chủ xe xác nhận đơn (xem accept), tránh spam yêu cầu để chiếm lượt.
        // Cọc 40% tiền thuê sau giảm, thanh toán ngay qua hệ thống (trong 30 phút) thì yêu cầu mới tới chủ xe.
        BigDecimal deposit = BookingMoneyPolicy.depositFor(q.rentalAmount().subtract(discount).max(BigDecimal.ZERO).add(deliveryFee));
        PaymentStatus initialDepositStatus = deposit.signum() > 0 ? PaymentStatus.UNPAID : PaymentStatus.NOT_REQUIRED;

        Booking booking = Booking.builder()
                .bookingCode(newCode())
                .car(car).customer(customer).owner(car.getOwner())
                .pickupAt(request.pickupAt()).returnAt(request.returnAt())
                .rentalDays(q.rentalDays()).rentalHours(q.rentalHours())
                .pricePerDay(q.pricePerDay()).pricePerHour(q.pricePerHour())
                .dayAmount(q.dayAmount()).hourAmount(q.hourAmount()).rentalAmount(q.rentalAmount())
                .voucher(voucher)
                .discountAmount(discount)
                .depositAmount(deposit)
                .depositStatus(initialDepositStatus)
                .deliveryAddress(deliveryKm != null ? trim(request.deliveryAddress()) : null)
                .deliveryLatitude(deliveryKm != null ? request.deliveryLatitude() : null)
                .deliveryLongitude(deliveryKm != null ? request.deliveryLongitude() : null)
                .deliveryDistanceKm(deliveryKm)
                .deliveryFee(deliveryFee)
                .kmLimitPerDay(car.getKmLimitPerDay()).extraKmFee(car.getExtraKmFee())
                .lateFeePerHour(car.getLateFeePerHour())
                .contactPhone(blank(request.contactPhone()) ? customer.getPhone() : request.contactPhone().trim())
                .customerNote(trim(request.customerNote()))
                .build();
        log.info("Tạo yêu cầu thuê xe carId={}, customerId={}", car.getId(), customer.getId());
        return toResponse(bookingRepository.saveAndFlush(booking));
    }

    @Override
    @Transactional
    public BookingResponse cancel(Long id, String reason) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = find(id);
        boolean admin = currentUserService.isAdmin(user);
        boolean isCustomer = b.getCustomer().getId().equals(user.getId());
        boolean isOwner = b.getOwner().getId().equals(user.getId());
        if (!admin && !isCustomer && !isOwner) {
            throw forbidden();
        }
        // Kể cả admin: đơn đã bắt đầu bàn giao/đang thuê phải xử lý qua biên bản và quyết toán, không huỷ thẳng.
        boolean adminCancellable = admin && b.getStatus() == BookingStatus.PICKUP_PENDING;
        if (b.getStatus() != BookingStatus.REQUESTED && b.getStatus() != BookingStatus.CONFIRMED && !adminCancellable) {
            throw conflict("Chỉ huỷ được đơn chưa bàn giao xe. Đơn đang thuê cần xử lý qua biên bản trả xe");
        }
        if (!admin && b.getStatus() == BookingStatus.CONFIRMED && !b.getPickupAt().isAfter(now())) {
            throw conflict("Đã quá giờ nhận xe, không thể tự huỷ đơn. Vui lòng liên hệ hỗ trợ");
        }
        // Chủ xe không được bỏ khách vào phút chót: đơn đã xác nhận chỉ tự huỷ được trước giờ nhận xe hơn 24 giờ.
        if (isOwner && !admin && b.getStatus() == BookingStatus.CONFIRMED
                && b.getPickupAt().isBefore(now().plusHours(24))) {
            throw conflict("Chủ xe không thể huỷ đơn đã xác nhận trong vòng 24 giờ trước giờ nhận xe. Vui lòng liên hệ quản trị viên");
        }
        if (isOwner && !admin && b.getStatus() == BookingStatus.REQUESTED) {
            throw conflict("Chủ xe dùng chức năng Từ chối cho yêu cầu chưa xác nhận");
        }
        String by = admin ? "ADMIN" : isOwner ? "OWNER" : "CUSTOMER";
        cancelWithSettlement(b, by, reason.trim());
        if ("OWNER".equals(by)) {
            enforceOwnerCancelLimit(b.getOwner());
        }
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /**
     * Huỷ đơn và lập phiếu tiền theo chính sách (xem {@link BookingMoneyPolicy}):
     * <ul>
     *   <li>Đơn chưa được chủ xe xác nhận, hoặc admin huỷ: hoàn 100% số khách đã trả.</li>
     *   <li>Khách huỷ (hoặc khách vắng mặt): phí huỷ tính từ lúc cọc; hoàn phần còn lại, phí chuyển cho chủ xe.</li>
     *   <li>Chủ xe huỷ (hoặc chủ xe không giao xe): phí huỷ tính từ lúc xác nhận; hoàn 100% + đền bù bằng phí huỷ,
     *       chủ xe bị phạt đúng khoản đền bù.</li>
     * </ul>
     */
    private void cancelWithSettlement(Booking b, String by, String reason) {
        boolean confirmed = b.getStatus() != BookingStatus.REQUESTED;
        LocalDateTime now = now();
        BigDecimal paid = paidByCustomer(b);
        BigDecimal tripValue = tripValue(b);
        BigDecimal fee = BigDecimal.ZERO;
        BigDecimal refund = paid;
        String rule = "hoàn 100%";
        // Vắng mặt khi nhận xe không được hưởng 1 giờ miễn phí: luôn tính mức phí sát ngày.
        boolean noShow = by.endsWith("NO_SHOW");
        if (confirmed && (by.startsWith("CUSTOMER"))) {
            fee = BookingMoneyPolicy.cancellationFee(tripValue, noShow ? null : b.getDepositPaidAt(), b.getPickupAt(), now).min(paid);
            refund = paid.subtract(fee);
            rule = BookingMoneyPolicy.cancellationRule(noShow ? null : b.getDepositPaidAt(), b.getPickupAt(), now);
        } else if (confirmed && by.startsWith("OWNER")) {
            fee = BookingMoneyPolicy.cancellationFee(tripValue, noShow ? null : b.getConfirmedAt(), b.getPickupAt(), now);
            refund = paid.add(paid.signum() > 0 ? fee : BigDecimal.ZERO);
            rule = BookingMoneyPolicy.cancellationRule(noShow ? null : b.getConfirmedAt(), b.getPickupAt(), now);
        }
        b.setStatus(BookingStatus.CANCELLED);
        b.setCancelReason(reason);
        b.setCancelledBy(by);
        b.setCancelledAt(now);
        b.setCancelFeeAmount(fee);
        b.setRefundAmount(refund);
        if (b.getVoucher() != null && confirmed) {
            voucherRepository.decreaseUsage(b.getVoucher().getId());
        }
        String code = b.getBookingCode();
        if (refund.signum() > 0) {
            settlementService.refundCustomer(b, refund, "Hoàn tiền đơn " + code + " (" + label(by) + "; " + rule + ")");
        }
        if (fee.signum() > 0 && by.startsWith("CUSTOMER") && paid.signum() > 0) {
            settlementService.payOwner(b, fee, "Phí huỷ chuyến đơn " + code + " do khách huỷ (" + rule + ")");
        }
        if (fee.signum() > 0 && by.startsWith("OWNER") && paid.signum() > 0) {
            settlementService.penalizeOwner(b, fee, "Đền bù cho khách do chủ xe huỷ đơn " + code + " (" + rule + ")");
        }
        log.info("Huỷ đơn {} bởi {}: đã trả={}, phí huỷ={}, hoàn khách={}", code, by, paid, fee, refund);
    }

    private static String label(String by) {
        return switch (by) {
            case "CUSTOMER" -> "khách huỷ";
            case "OWNER" -> "chủ xe huỷ";
            case "CUSTOMER_NO_SHOW" -> "khách không đến nhận xe";
            case "OWNER_NO_SHOW" -> "chủ xe không giao xe";
            case "ADMIN" -> "quản trị viên huỷ";
            default -> "hệ thống huỷ";
        };
    }

    /** Đóng yêu cầu chưa được xác nhận (từ chối / hết hạn): hoàn 100% tiền cọc nếu khách đã trả. */
    private void closeUnconfirmed(Booking b, BookingStatus status, String reason) {
        b.setStatus(status);
        if (status == BookingStatus.REJECTED) {
            b.setRejectReason(reason);
        } else {
            b.setCancelReason(reason);
        }
        BigDecimal paid = paidByCustomer(b);
        b.setRefundAmount(paid);
        if (paid.signum() > 0) {
            settlementService.refundCustomer(b, paid, "Hoàn 100% tiền cọc đơn " + b.getBookingCode() + " (" + reason + ")");
        }
    }

    // ================================================================== thanh toán qua hệ thống

    /** Số tiền khách cần thanh toán cho từng khoản, kèm kiểm tra trạng thái đơn. */
    @Override
    @Transactional(readOnly = true)
    public BigDecimal amountDue(Booking b, TransactionType type) {
        switch (type) {
            case BOOKING_DEPOSIT -> {
                if (b.getStatus() != BookingStatus.REQUESTED) {
                    throw bad("Chỉ đặt cọc khi yêu cầu thuê đang chờ (vừa đặt xe)");
                }
                if (b.getDepositStatus() != PaymentStatus.UNPAID) {
                    throw bad("Đơn thuê này đã được thanh toán tiền cọc");
                }
                return b.getDepositAmount();
            }
            case BOOKING_PAYMENT -> {
                boolean pickupConfirmed = b.getStatus() == BookingStatus.PICKUP_PENDING
                        && handoverRepository.findByBookingIdAndHandoverType(b.getId(), HandoverType.PICKUP)
                                .map(h -> h.getStatus() == HandoverStatus.CONFIRMED).orElse(false);
                if (!pickupConfirmed) {
                    throw bad("Chỉ thanh toán phần còn lại sau khi bạn đã kiểm tra và xác nhận biên bản nhận xe hoàn toàn đúng");
                }
                if (b.getRentalPaymentStatus() == PaymentStatus.PAID) {
                    throw bad("Đơn thuê đã được thanh toán đủ tiền thuê");
                }
                BigDecimal remaining = remainingRental(b);
                if (remaining.signum() <= 0) {
                    throw bad("Đơn thuê không còn khoản tiền thuê cần thanh toán");
                }
                return remaining;
            }
            case BOOKING_EXTRA_FEE -> {
                if (b.getStatus() != BookingStatus.RETURN_PENDING || b.getExtraFeeStatus() != PaymentStatus.UNPAID) {
                    throw bad("Đơn thuê không có phí phát sinh cần thanh toán");
                }
                return b.getFinalAmount();
            }
            default -> throw bad("Loại thanh toán không hợp lệ cho đơn thuê");
        }
    }

    /** Cập nhật đơn thuê khi cổng thanh toán xác nhận giao dịch thành công (gọi đồng bộ từ VNPay return/IPN). */
    @Override
    @Transactional
    public void applyPayment(com.carrental.entity.Transaction tx) {
        Booking b = tx.getBooking();
        if (b == null) {
            return;
        }
        b = find(b.getId());
        switch (tx.getTransactionType()) {
            case BOOKING_DEPOSIT -> {
                b.setDepositStatus(PaymentStatus.PAID);
                b.setDepositPaidAt(now());
                if (b.getStatus() != BookingStatus.REQUESTED) {
                    // Đơn đã hết hạn/bị huỷ trong lúc khách đang thanh toán: hoàn lại ngay.
                    b.setRefundAmount(b.getDepositAmount());
                    settlementService.refundCustomer(b, b.getDepositAmount(),
                            "Hoàn tiền cọc đơn " + b.getBookingCode() + " (thanh toán sau khi đơn đã đóng)");
                }
                if (remainingRental(b).signum() <= 0) {
                    b.setRentalPaymentStatus(PaymentStatus.PAID);
                }
            }
            case BOOKING_PAYMENT -> {
                b.setRentalPaymentStatus(PaymentStatus.PAID);
                b.setRentalPaidAt(now());
                // Sau khi khách thanh toán xong phần còn lại, giữ trạng thái PICKUP_PENDING
                // để tài khoản chủ xe hiển thị thông báo đã nhận đủ thanh toán và bấm "Xác nhận bắt đầu thuê xe".
            }
            case BOOKING_EXTRA_FEE -> {
                b.setExtraFeeStatus(PaymentStatus.PAID);
                if (b.getStatus() == BookingStatus.RETURN_PENDING) {
                    completeTrip(b);
                }
            }
            default -> { return; }
        }
        bookingRepository.saveAndFlush(b);
        log.info("Ghi nhận thanh toán {} cho đơn {}", tx.getTransactionType(), b.getBookingCode());
    }

    /** Hoàn tất chuyến: chi trả cho chủ xe tiền thuê gốc (nền tảng chịu khoản giảm giá voucher) + phí phát sinh. */
    private void completeTrip(Booking b) {
        b.setStatus(BookingStatus.COMPLETED);
        b.setCompletedAt(now());
        BigDecimal extras = nz(b.getExtraKmAmount()).add(nz(b.getLateAmount())).add(nz(b.getFuelFeeAmount()))
                .add(nz(b.getOtherFeeAmount()));
        BigDecimal gross = b.getRentalAmount().add(nz(b.getDeliveryFee())).add(extras);
        String detail = "tiền thuê " + b.getRentalAmount().toPlainString() + "đ"
                + (nz(b.getDeliveryFee()).signum() > 0 ? " + phí giao xe " + b.getDeliveryFee().toPlainString() + "đ" : "")
                + (nz(b.getDiscountAmount()).signum() > 0 ? " (gồm " + b.getDiscountAmount().toPlainString() + "đ voucher nền tảng bù)" : "")
                + (extras.signum() > 0 ? " + phí phát sinh " + extras.toPlainString() + "đ" : "");
        settlementService.payOwner(b, gross, "Chi trả đơn " + b.getBookingCode() + ": " + detail);
    }

    private static BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    /** Giá trị chuyến = tiền thuê sau giảm giá + phí giao xe. */
    public static BigDecimal tripValue(Booking b) {
        BigDecimal discount = b.getDiscountAmount() != null ? b.getDiscountAmount() : BigDecimal.ZERO;
        return b.getRentalAmount().subtract(discount).max(BigDecimal.ZERO).add(nz(b.getDeliveryFee()));
    }

    /** Số tiền thuê khách đã trả qua hệ thống (cọc + phần còn lại). */
    public static BigDecimal paidByCustomer(Booking b) {
        BigDecimal paid = BigDecimal.ZERO;
        if (b.getDepositStatus() == PaymentStatus.PAID && b.getDepositAmount() != null) {
            paid = paid.add(b.getDepositAmount());
        }
        if (b.getRentalPaymentStatus() == PaymentStatus.PAID) {
            paid = paid.add(remainingRental(b));
        }
        return paid;
    }

    /** Phần tiền thuê còn lại sau cọc. */
    public static BigDecimal remainingRental(Booking b) {
        BigDecimal deposit = b.getDepositAmount() != null ? b.getDepositAmount() : BigDecimal.ZERO;
        return tripValue(b).subtract(deposit).max(BigDecimal.ZERO);
    }

    /** Chủ xe huỷ quá {@value BookingMoneyPolicy#OWNER_CANCEL_LIMIT} lần trong 30 ngày: tạm ẩn toàn bộ tin đăng. */
    private void enforceOwnerCancelLimit(Customer owner) {
        long count = bookingRepository.countByOwnerIdAndCancelledByAndCancelledAtAfter(owner.getId(), "OWNER", now().minusDays(30))
                + bookingRepository.countByOwnerIdAndCancelledByAndCancelledAtAfter(owner.getId(), "OWNER_NO_SHOW", now().minusDays(30));
        if (count >= BookingMoneyPolicy.OWNER_CANCEL_LIMIT) {
            carRepository.findAll().stream()
                    .filter(c -> c.getOwner() != null && c.getOwner().getId().equals(owner.getId())
                            && c.getListingStatus() == ListingStatus.LISTED)
                    .forEach(c -> {
                        c.setListingStatus(ListingStatus.UNLISTED);
                        carRepository.save(c);
                    });
            log.warn("Chủ xe {} huỷ {} đơn trong 30 ngày -> tạm ẩn toàn bộ tin đăng", owner.getId(), count);
        }
    }

    // ================================================================== vắng mặt khi nhận xe

    /** Chủ xe báo khách không đến nhận xe (sau giờ nhận 2 giờ): tính như khách huỷ sát ngày. */
    @Override
    @Transactional
    public BookingResponse reportCustomerNoShow(Long id) {
        Booking b = ownedBooking(id);
        requireStatus(b, BookingStatus.CONFIRMED);
        if (now().isBefore(b.getPickupAt().plus(BookingMoneyPolicy.CUSTOMER_NO_SHOW_GRACE))) {
            throw conflict("Chỉ báo khách vắng mặt sau giờ nhận xe 2 giờ");
        }
        cancelWithSettlement(b, "CUSTOMER_NO_SHOW", "Khách không đến nhận xe");
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /** Khách báo chủ xe không giao xe (sau giờ nhận 1 giờ, chưa có biên bản): tính như chủ xe huỷ. */
    @Override
    @Transactional
    public BookingResponse reportOwnerNoShow(Long id) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = find(id);
        if (!b.getCustomer().getId().equals(user.getId())) {
            throw forbidden();
        }
        requireStatus(b, BookingStatus.CONFIRMED);
        if (now().isBefore(b.getPickupAt().plus(BookingMoneyPolicy.OWNER_NO_SHOW_GRACE))) {
            throw conflict("Chỉ báo chủ xe không giao xe sau giờ nhận xe 1 giờ");
        }
        cancelWithSettlement(b, "OWNER_NO_SHOW", "Chủ xe không giao xe đúng hẹn");
        enforceOwnerCancelLimit(b.getOwner());
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    // ================================================================== chủ xe

    @Override
    @Transactional
    public BookingResponse reportReturned(Long id) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = find(id);
        if (!b.getCustomer().getId().equals(user.getId())) {
            throw forbidden();
        }
        requireStatus(b, BookingStatus.IN_PROGRESS);
        if (b.getReturnReportedAt() == null) {
            b.setReturnReportedAt(now());
        }
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /**
     * Người thuê phải có danh tính đã duyệt (KYC VERIFIED) và giấy phép lái xe đã duyệt,
     * còn hạn đến hết thời gian thuê.
     */
    private void requireVerifiedDriver(Customer customer, LocalDateTime returnAt) {
        if (customer.getKycStatus() != com.carrental.enums.KycStatus.VERIFIED) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Bạn cần xác minh danh tính (CCCD/Hộ chiếu) trước khi thuê xe");
        }
        var licenses = userDocumentRepository.findByCustomerId(customer.getId()).stream()
                .filter(d -> d.getDocType() == com.carrental.enums.DocumentType.DRIVER_LICENSE
                        && d.getVerifyStatus() == com.carrental.enums.VerificationStatus.APPROVED)
                .toList();
        if (licenses.isEmpty()) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Bạn cần chụp ảnh giấy phép lái xe, nhập thông tin và chờ quản trị viên duyệt trước khi thuê xe");
        }
        // Ngày trả xe phải trước ngày hết hạn GPLX ít nhất 10 ngày (phòng xe về trễ / bất khả kháng).
        boolean validLicense = licenses.stream().anyMatch(d -> d.getExpiresAt() == null
                || !returnAt.toLocalDate().isAfter(d.getExpiresAt().minusDays(BookingMoneyPolicy.LICENSE_BUFFER_DAYS)));
        if (!validLicense) {
            java.time.LocalDate latest = licenses.stream().map(com.carrental.entity.UserDocument::getExpiresAt)
                    .filter(java.util.Objects::nonNull).max(java.time.LocalDate::compareTo).orElseThrow()
                    .minusDays(BookingMoneyPolicy.LICENSE_BUFFER_DAYS);
            throw new AppException(HttpStatus.FORBIDDEN, "Giấy phép lái xe phải còn hạn ít nhất "
                    + BookingMoneyPolicy.LICENSE_BUFFER_DAYS + " ngày sau ngày trả xe. Với GPLX hiện tại, ngày trả xe muộn nhất là "
                    + latest.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        }
    }

    /** Chủ xe xác nhận đã gọi/nhắn cho khách và ghi lại nội dung trao đổi. */
    @Override
    @Transactional
    public BookingResponse markContacted(Long id, ContactRequest request) {
        Booking b = ownedBooking(id);
        if (b.getStatus() != BookingStatus.REQUESTED && b.getStatus() != BookingStatus.CONFIRMED) {
            throw conflict("Đơn không còn ở giai đoạn liên hệ");
        }
        LocalDateTime contactedAt = now();
        if (b.getOwnerContactedAt() == null) {
            b.setOwnerContactedAt(contactedAt);
        }
        // Giữ lịch sử các lần liên hệ (mới nhất ở cuối) thay vì ghi đè; cột tối đa 1000 ký tự.
        String entry = "[" + contactedAt.format(java.time.format.DateTimeFormatter.ofPattern("HH:mm dd/MM/yyyy")) + "] "
                + request.contactNote().trim();
        String history = blank(b.getContactNote()) ? entry : b.getContactNote() + "\n" + entry;
        b.setContactNote(history.length() > 1000 ? history.substring(history.length() - 1000) : history);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    @Override
    @Transactional
    public BookingResponse accept(Long id) {
        Booking b = ownedBooking(id);
        requireStatus(b, BookingStatus.REQUESTED);
        if (b.getOwnerContactedAt() == null) {
            throw conflict("Vui lòng liên hệ khách và xác nhận đã liên hệ trước khi nhận đơn");
        }
        if (b.getPickupAt().isBefore(now())) {
            throw conflict("Đã quá giờ nhận xe của yêu cầu này");
        }
        if (b.getDepositStatus() == PaymentStatus.UNPAID) {
            throw conflict("Khách chưa thanh toán tiền cọc, chưa thể xác nhận đơn");
        }
        BankAccountServiceImpl.requireBankAccount(b.getOwner(), "để nhận tiền thuê xe trước khi xác nhận đơn");
        boolean customerBusy = bookingRepository.findCustomerOverlapping(b.getCustomer().getId(), b.getPickupAt(), b.getReturnAt(), HOLDING)
                .stream().anyMatch(o -> !o.getId().equals(b.getId()));
        if (customerBusy) {
            throw conflict("Khách đã có chuyến thuê khác được xác nhận trùng thời gian");
        }
        carRepository.findWithLockById(b.getCar().getId());
        if (!bookingRepository.findOverlapping(b.getCar().getId(), b.getPickupAt(), b.getReturnAt(), HOLDING).isEmpty()) {
            throw conflict("Xe đã có đơn khác được xác nhận trùng thời gian");
        }
        // Trừ lượt voucher tại thời điểm xác nhận; voucher vừa hết lượt thì đơn vẫn được nhận nhưng bỏ giảm giá.
        if (b.getVoucher() != null && voucherRepository.increaseUsage(b.getVoucher().getId()) == 0) {
            log.info("Voucher {} hết lượt khi xác nhận đơn {}, bỏ giảm giá", b.getVoucher().getCode(), b.getId());
            b.setVoucher(null);
            b.setDiscountAmount(BigDecimal.ZERO);
        }
        b.setStatus(BookingStatus.CONFIRMED);
        b.setConfirmedAt(now());
        // Các yêu cầu khác trùng giờ không thể được nhận nữa: từ chối ngay để khách không phải chờ vô ích.
        List<Booking> competing = bookingRepository.findOverlapping(b.getCar().getId(), b.getPickupAt(), b.getReturnAt(),
                EnumSet.of(BookingStatus.REQUESTED));
        for (Booking other : competing) {
            if (other.getId().equals(b.getId())) {
                continue;
            }
            closeUnconfirmed(other, BookingStatus.REJECTED, "Xe đã được xác nhận cho khách khác trong khung giờ này");
        }
        bookingRepository.saveAll(competing);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    @Override
    @Transactional
    public BookingResponse reject(Long id, String reason) {
        Booking b = ownedBooking(id);
        requireStatus(b, BookingStatus.REQUESTED);
        closeUnconfirmed(b, BookingStatus.REJECTED, reason.trim());
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    // ================================================================== biên bản bàn giao

    @Override
    @Transactional
    public BookingResponse submitHandover(Long id, HandoverType type, SubmitHandoverRequest request, List<MultipartFile> photos) {
        Booking b = ownedBooking(id);
        requireStatus(b, type == HandoverType.PICKUP ? BookingStatus.CONFIRMED : BookingStatus.IN_PROGRESS);
        if (handoverRepository.findByBookingIdAndHandoverType(id, type).isPresent()) {
            throw conflict("Biên bản đã được lập, hãy chỉnh sửa theo yêu cầu của khách");
        }
        if (photos == null || photos.size() != request.items().size()) {
            throw bad("Số lượng ảnh tải lên (" + (photos != null ? photos.size() : 0) + ") phải khớp với số hạng mục (" + request.items().size() + ")");
        }
        Set<HandoverCategory> provided = request.items().stream().map(HandoverItemInput::category)
                .collect(Collectors.toSet());
        List<String> missing = new ArrayList<>();
        for (HandoverCategory category : HandoverCategory.values()) {
            if (category.required() && !provided.contains(category)) {
                missing.add(category.label());
            }
        }
        if (!missing.isEmpty()) {
            throw bad("Biên bản còn thiếu ảnh: " + String.join(", ", missing));
        }
        if (type == HandoverType.RETURN && b.getPickupOdometerKm() != null
                && request.odometerKm() < b.getPickupOdometerKm()) {
            throw bad("Số km khi trả (" + request.odometerKm() + ") không được nhỏ hơn lúc nhận (" + b.getPickupOdometerKm() + ")");
        }
        if (type == HandoverType.PICKUP) {
            // Kiểm tra lại giấy tờ lúc giao xe: GPLX có thể đã hết hạn hoặc bị thu hồi sau khi đặt.
            requireVerifiedDriver(b.getCustomer(), b.getReturnAt());
        }

        List<String> storedUrls = publicImageStorageService.storeImages(photos);
        Handover h = Handover.builder().booking(b).handoverType(type).odometerKm(request.odometerKm())
                .fuelPercent(request.fuelPercent()).ownerNote(trim(request.ownerNote())).submittedAt(now()).build();
        int order = 0;
        for (int i = 0; i < request.items().size(); i++) {
            HandoverItemInput input = request.items().get(i);
            h.getItems().add(HandoverItem.builder().handover(h).category(input.category())
                    .photoUrl(storedUrls.get(i)).conditionNote(trim(input.conditionNote()))
                    .sortOrder(order++).build());
        }
        handoverRepository.saveAndFlush(h);

        if (type == HandoverType.RETURN) {
            settle(b, request.odometerKm(), request.fuelPercent(), request.otherFeeAmount(), request.otherFeeNote());
        }
        b.setStatus(type == HandoverType.PICKUP ? BookingStatus.PICKUP_PENDING : BookingStatus.RETURN_PENDING);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /** Khách xem từng mục: đồng ý, hoặc yêu cầu chủ xe sửa kèm ghi chú. */
    @Override
    @Transactional
    public BookingResponse respondHandover(Long id, HandoverType type, RespondHandoverRequest request) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = find(id);
        if (!b.getCustomer().getId().equals(user.getId())) {
            throw forbidden();
        }
        requireStatus(b, type == HandoverType.PICKUP ? BookingStatus.PICKUP_PENDING : BookingStatus.RETURN_PENDING);
        Handover h = handover(id, type);
        if (h.getStatus() != HandoverStatus.SUBMITTED) {
            throw conflict("Chủ xe đang chỉnh sửa biên bản theo yêu cầu của bạn");
        }
        Map<Long, HandoverItem> open = new HashMap<>();
        for (HandoverItem item : h.getItems()) {
            if (item.getStatus() == HandoverItemStatus.PENDING || item.getStatus() == HandoverItemStatus.REVISED) {
                open.put(item.getId(), item);
            }
        }
        Map<Long, ItemDecision> decisions = (request.decisions() == null ? List.<ItemDecision>of() : request.decisions()).stream()
                .collect(Collectors.toMap(ItemDecision::itemId, d -> d, (x, y) -> y));
        if (!decisions.keySet().equals(open.keySet())) {
            throw bad("Vui lòng phản hồi đầy đủ các hạng mục đang chờ xác nhận");
        }
        boolean anyDisputed = false;
        for (ItemDecision d : decisions.values()) {
            HandoverItem item = open.get(d.itemId());
            if (d.accepted()) {
                item.setStatus(HandoverItemStatus.ACCEPTED);
                item.setDisputeNote(null);
            } else {
                if (blank(d.disputeNote())) {
                    throw bad("Vui lòng ghi rõ cần sửa gì ở mục \"" + item.getCategory().label() + "\"");
                }
                item.setStatus(HandoverItemStatus.DISPUTED);
                item.setDisputeNote(d.disputeNote().trim());
                anyDisputed = true;
            }
        }
        h.setCustomerNote(trim(request.customerNote()));
        if (type == HandoverType.RETURN && Boolean.TRUE.equals(request.disputeFees())) {
            if (blank(request.customerNote())) {
                throw bad("Vui lòng ghi rõ lý do không đồng ý với phí phát sinh");
            }
            anyDisputed = true;
        }
        if (anyDisputed) {
            h.setStatus(HandoverStatus.DISPUTED);
        } else {
            h.setStatus(HandoverStatus.CONFIRMED);
            h.setConfirmedAt(now());
            if (type == HandoverType.PICKUP) {
                b.setPickupOdometerKm(h.getOdometerKm());
                if (remainingRental(b).signum() <= 0) {
                    b.setRentalPaymentStatus(PaymentStatus.PAID);
                }
                // Giữ đơn ở trạng thái PICKUP_PENDING (biên bản đã CONFIRMED):
                // 1) Khách thanh toán số tiền thuê còn lại qua hệ thống
                // 2) Sau khi thanh toán xong, chủ xe thấy thông báo đã nhận đủ thanh toán và bấm "Xác nhận bắt đầu thuê xe" để chuyển sang IN_PROGRESS.
            } else {
                b.setReturnedAt(now());
                if (nz(b.getFinalAmount()).signum() > 0) {
                    // Có phí phát sinh: khách thanh toán qua hệ thống rồi chuyến mới hoàn tất.
                    b.setExtraFeeStatus(PaymentStatus.UNPAID);
                } else {
                    completeTrip(b);
                }
            }
        }
        handoverRepository.saveAndFlush(h);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /**
     * Chủ xe xác nhận bắt đầu chuyến thuê sau khi:
     * 1) Khách đã xác nhận biên bản nhận xe đúng hiện trạng (HandoverStatus.CONFIRMED)
     * 2) Khách đã thanh toán đủ phần tiền thuê còn lại (rentalPaymentStatus == PAID)
     */
    @Override
    @Transactional
    public BookingResponse startTrip(Long id) {
        Booking b = ownedBooking(id);
        requireStatus(b, BookingStatus.PICKUP_PENDING);
        Handover h = handover(id, HandoverType.PICKUP);
        if (h.getStatus() != HandoverStatus.CONFIRMED) {
            throw conflict("Khách thuê chưa xác nhận biên bản nhận xe đúng hiện trạng");
        }
        if (b.getRentalPaymentStatus() != PaymentStatus.PAID && remainingRental(b).signum() > 0) {
            throw conflict("Khách thuê chưa thanh toán đủ số tiền thuê còn lại qua hệ thống");
        }
        b.setStatus(BookingStatus.IN_PROGRESS);
        if (b.getPickedUpAt() == null) {
            b.setPickedUpAt(now());
        }
        if (b.getPickupOdometerKm() == null) {
            b.setPickupOdometerKm(h.getOdometerKm());
        }
        log.info("Chủ xe xác nhận bắt đầu thuê xe cho đơn {}", b.getBookingCode());
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /** Chủ xe sửa đúng các mục khách yêu cầu rồi gửi lại cho khách. */
    @Override
    @Transactional
    public BookingResponse reviseHandover(Long id, HandoverType type, ReviseHandoverRequest request, List<MultipartFile> photos) {
        Booking b = ownedBooking(id);
        Handover h = handover(id, type);
        if (h.getStatus() != HandoverStatus.DISPUTED) {
            throw conflict("Biên bản không có mục nào cần sửa");
        }
        List<ItemRevision> revisions = request.revisions() == null ? List.of() : request.revisions();
        int photoCount = photos == null ? 0 : photos.size();
        if (photoCount != revisions.size()) {
            throw bad("Số lượng ảnh tải lên (" + photoCount + ") phải khớp với số mục cần sửa (" + revisions.size() + ")");
        }
        Map<Long, HandoverItem> disputed = new HashMap<>();
        for (HandoverItem item : h.getItems()) {
            if (item.getStatus() == HandoverItemStatus.DISPUTED) {
                disputed.put(item.getId(), item);
            }
        }
        Set<Long> revised = revisions.stream().map(ItemRevision::itemId).collect(Collectors.toSet());
        if (!revised.equals(disputed.keySet())) {
            throw bad("Vui lòng sửa đúng và đủ các mục khách yêu cầu");
        }
        List<String> storedUrls = revisions.isEmpty() ? List.of() : publicImageStorageService.storeImages(photos);
        for (int i = 0; i < revisions.size(); i++) {
            ItemRevision r = revisions.get(i);
            HandoverItem item = disputed.get(r.itemId());
            item.setPhotoUrl(storedUrls.get(i));
            item.setConditionNote(trim(r.conditionNote()));
            item.setStatus(HandoverItemStatus.REVISED);
        }
        if (request.odometerKm() != null) {
            if (type == HandoverType.RETURN && b.getPickupOdometerKm() != null
                    && request.odometerKm() < b.getPickupOdometerKm()) {
                throw bad("Số km khi trả không được nhỏ hơn lúc nhận");
            }
            h.setOdometerKm(request.odometerKm());
        }
        if (request.fuelPercent() != null) {
            h.setFuelPercent(request.fuelPercent());
        }
        if (request.ownerNote() != null) {
            h.setOwnerNote(trim(request.ownerNote()));
        }
        h.setRevision(h.getRevision() + 1);
        h.setStatus(HandoverStatus.SUBMITTED);
        h.setSubmittedAt(now());
        handoverRepository.saveAndFlush(h);
        if (type == HandoverType.RETURN) {
            BigDecimal fee = request.otherFeeAmount() != null ? request.otherFeeAmount() : b.getOtherFeeAmount();
            String feeNote = request.otherFeeNote() != null ? request.otherFeeNote() : b.getOtherFeeNote();
            settle(b, h.getOdometerKm(), h.getFuelPercent(), fee, feeNote);
            bookingRepository.saveAndFlush(b);
        }
        return toResponse(b);
    }

    /** Chốt phí phát sinh khi trả xe: quá km, trễ giờ, phí khác. */
    private void settle(Booking b, int returnOdometer, Integer returnFuel, BigDecimal otherFee, String otherFeeNote) {
        // Mốc tính phí trễ: lần đầu khách báo trả xe hoặc chủ xe lập biên bản trả; sửa biên bản sau đó không đổi mốc.
        if (b.getReturnReportedAt() == null) {
            b.setReturnReportedAt(now());
        }
        LocalDateTime now = b.getReturnReportedAt();
        b.setReturnOdometerKm(returnOdometer);
        BigDecimal extraKm = BigDecimal.ZERO;
        if (b.getKmLimitPerDay() != null && b.getExtraKmFee() != null && b.getPickupOdometerKm() != null) {
            int chargedDays = Math.max(1, b.getRentalDays() + (b.getRentalHours() > 0 ? 1 : 0));
            int over = returnOdometer - b.getPickupOdometerKm() - b.getKmLimitPerDay() * chargedDays;
            if (over > 0) {
                extraKm = b.getExtraKmFee().multiply(BigDecimal.valueOf(over));
            }
        }
        BigDecimal late = BigDecimal.ZERO;
        if (b.getLateFeePerHour() != null && now.isAfter(b.getReturnAt().plusMinutes(15))) {
            long lateHours = (Duration.between(b.getReturnAt(), now).toMinutes() + 59) / 60;
            late = b.getLateFeePerHour().multiply(BigDecimal.valueOf(lateHours));
        }
        BigDecimal other = otherFee == null || otherFee.signum() < 0 ? BigDecimal.ZERO : otherFee;
        if (other.signum() > 0 && blank(otherFeeNote)) {
            throw bad("Vui lòng ghi rõ lý do phí khác");
        }
        // Mức trần phí khác: không vượt quá tiền thuê gốc của chuyến (hư hỏng lớn hơn cần xử lý qua khiếu nại/bảo hiểm).
        if (other.compareTo(b.getRentalAmount()) > 0) {
            throw bad("Phí khác tối đa bằng tiền thuê gốc (" + b.getRentalAmount().toPlainString() + "đ). Thiệt hại lớn hơn vui lòng liên hệ quản trị viên");
        }
        b.setExtraKmAmount(extraKm);
        b.setLateAmount(late);
        b.setOtherFeeAmount(other);
        b.setOtherFeeNote(trim(otherFeeNote));

        // Phí xăng/pin hụt so với lúc nhận xe.
        BigDecimal fuelFee = BigDecimal.ZERO;
        Integer pickupFuel = handoverRepository.findByBookingIdAndHandoverType(b.getId(), HandoverType.PICKUP)
                .map(Handover::getFuelPercent).orElse(null);
        if (pickupFuel != null && returnFuel != null && returnFuel < pickupFuel) {
            fuelFee = BookingMoneyPolicy.FUEL_FEE_PER_PERCENT.multiply(BigDecimal.valueOf(pickupFuel - returnFuel));
        }
        b.setFuelFeeAmount(fuelFee);
        // Tiền thuê đã trả đủ trước khi nhận xe; khi trả xe khách chỉ còn thanh toán phí phát sinh.
        b.setFinalAmount(extraKm.add(late).add(other).add(fuelFee));
    }

    // ================================================================== đọc

    @Override
    @Transactional(readOnly = true)
    public BookingResponse get(Long id) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = find(id);
        if (!currentUserService.isAdmin(user) && !b.getCustomer().getId().equals(user.getId())
                && !b.getOwner().getId().equals(user.getId())) {
            throw forbidden();
        }
        return toResponse(b);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> mineAsCustomer() {
        Customer user = currentUserService.getCurrentUser();
        return toResponses(bookingRepository.findAllByCustomerIdOrderByPickupAtDesc(user.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> mineAsOwner() {
        Customer user = currentUserService.getCurrentUser();
        CurrentUserService.requireVerifiedOwner(user);
        return toResponses(bookingRepository.findAllByOwnerIdOrderByPickupAtDesc(user.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> adminList(BookingStatus status, Long carId, String q, Pageable pageable) {
        Specification<Booking> spec = (root, query, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            if (status != null) ps.add(cb.equal(root.get("status"), status));
            if (carId != null) ps.add(cb.equal(root.get("car").get("id"), carId));
            if (!blank(q)) {
                String like = "%" + q.trim().toLowerCase() + "%";
                ps.add(cb.or(cb.like(cb.lower(root.get("bookingCode")), like),
                        cb.like(cb.lower(root.get("customer").get("fullName")), like),
                        cb.like(cb.lower(root.get("owner").get("fullName")), like),
                        cb.like(cb.lower(root.get("car").get("licensePlate")), like)));
            }
            return cb.and(ps.toArray(new Predicate[0]));
        };
        Page<Booking> page = bookingRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    /** Khách chỉ được đánh giá xe mình đã thuê xong. */
    @Override
    @Transactional(readOnly = true)
    public boolean hasCompletedTrip(Long carId, Long customerId) {
        return bookingRepository.existsByCarIdAndCustomerIdAndStatus(carId, customerId, BookingStatus.COMPLETED);
    }

    // ================================================================== tự động

    /** Yêu cầu chưa được chủ xe nhận mà đã tới giờ nhận xe thì hết hạn; hoàn 100% nếu khách đã cọc. */
    @Override
    @Transactional
    public int expireStaleRequests() {
        List<Booking> stale = bookingRepository.findAllByStatusAndPickupAtBefore(BookingStatus.REQUESTED, now());
        for (Booking b : stale) {
            closeUnconfirmed(b, BookingStatus.EXPIRED, "Đã tới giờ nhận xe mà chủ xe chưa xác nhận");
        }
        bookingRepository.saveAll(stale);
        return stale.size();
    }

    /**
     * Hạn của yêu cầu thuê:
     * <ul>
     *   <li>Khách chưa thanh toán cọc sau {@link BookingMoneyPolicy#DEPOSIT_PAYMENT_WINDOW} kể từ khi đặt: hết hạn.</li>
     *   <li>Khách đã cọc nhưng chủ xe không phản hồi trong {@link BookingMoneyPolicy#OWNER_RESPONSE_WINDOW}: tự từ chối, hoàn 100%.</li>
     * </ul>
     */
    @Override
    @Transactional
    public int cancelUnpaidDeposits() {
        LocalDateTime now = now();
        int closed = 0;
        for (Booking b : bookingRepository.findAllByStatusAndDepositStatus(BookingStatus.REQUESTED, PaymentStatus.UNPAID)) {
            if (b.getCreatedAt() != null && !b.getCreatedAt().plus(BookingMoneyPolicy.DEPOSIT_PAYMENT_WINDOW).isAfter(now)) {
                closeUnconfirmed(b, BookingStatus.EXPIRED, "Quá 30 phút chưa thanh toán tiền cọc");
                bookingRepository.save(b);
                closed++;
            }
        }
        for (Booking b : bookingRepository.findAllByStatusAndDepositStatus(BookingStatus.REQUESTED, PaymentStatus.PAID)) {
            if (b.getDepositPaidAt() != null && !b.getDepositPaidAt().plus(BookingMoneyPolicy.OWNER_RESPONSE_WINDOW).isAfter(now)) {
                closeUnconfirmed(b, BookingStatus.REJECTED, "Chủ xe không phản hồi trong 24 giờ");
                bookingRepository.save(b);
                closed++;
            }
        }
        return closed;
    }

    private Voucher resolveVoucher(String voucherCode, BigDecimal rentalAmount, Customer customer) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return null;
        }
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Mã voucher không tồn tại"));
        LocalDateTime now = now();
        if (voucher.getStatus() != VoucherStatus.ACTIVE
                || now.isBefore(voucher.getStartAt()) || !now.isBefore(voucher.getEndAt())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết hạn hoặc chưa đến thời gian sử dụng");
        }
        if (rentalAmount.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê chưa đạt giá trị tối thiểu "
                    + voucher.getMinOrderAmount().toPlainString() + "đ để dùng voucher");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
        }
        if (customer != null) {
            long used = bookingRepository.countByVoucherIdAndCustomerIdAndStatusNotIn(
                    voucher.getId(), customer.getId(),
                    List.of(BookingStatus.CANCELLED, BookingStatus.REJECTED, BookingStatus.EXPIRED));
            if (used >= voucher.getPerUserLimit()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã dùng hết lượt của voucher này");
            }
        }
        return voucher;
    }

    private static BigDecimal calculateDiscount(Voucher voucher, BigDecimal price) {
        if (voucher == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount = voucher.getDiscountValue();
        if (voucher.getDiscountType() == DiscountType.PERCENT) {
            discount = price.multiply(voucher.getDiscountValue()).divide(BigDecimal.valueOf(100), 0, RoundingMode.DOWN);
            if (voucher.getMaxDiscount() != null) {
                discount = discount.min(voucher.getMaxDiscount());
            }
        }
        return discount.min(price);
    }

    // ================================================================== helpers

    @Override
    public BookingResponse toResponse(Booking b) {
        String image = carImageRepository.findByCarIdAndIsPrimaryTrue(b.getCar().getId())
                .map(CarImage::getImageUrl).orElse(null);
        boolean reviewed = b.getStatus() == BookingStatus.COMPLETED
                && reviewRepository.existsByBookingId(b.getId());
        return BookingResponse.from(b, image, reviewed, handoverRepository.findAllByBookingIdOrderByIdAsc(b.getId()));
    }

    private List<BookingResponse> toResponses(List<Booking> list) {
        return list.stream().map(this::toResponse).toList();
    }

    private Car publicCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
        if (car.getStatus() != CarStatus.ACTIVE) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId);
        }
        return car;
    }

    private Booking find(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + id));
    }

    private Booking ownedBooking(Long id) {
        Customer user = currentUserService.getCurrentUser();
        if (user.getStatus() != CustomerStatus.ACTIVE) {
            throw forbidden();
        }
        Booking b = find(id);
        if (!b.getOwner().getId().equals(user.getId())) {
            throw forbidden();
        }
        return b;
    }

    private Handover handover(Long bookingId, HandoverType type) {
        return handoverRepository.findByBookingIdAndHandoverType(bookingId, type)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Chưa có biên bản "
                        + (type == HandoverType.PICKUP ? "nhận xe" : "trả xe")));
    }

    private static void requireStatus(Booking b, BookingStatus expected) {
        if (b.getStatus() != expected) {
            throw conflict("Đơn đang ở trạng thái " + b.getStatus() + ", không thực hiện được thao tác này");
        }
    }

    private String newCode() {
        String date = now().format(DateTimeFormatter.BASIC_ISO_DATE);
        String alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder("BK-").append(date).append('-');
            for (int i = 0; i < 5; i++) sb.append(alphabet.charAt(RANDOM.nextInt(alphabet.length())));
            if (!bookingRepository.existsByBookingCode(sb.toString())) return sb.toString();
        }
        throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không tạo được mã đơn, vui lòng thử lại");
    }

    private LocalDateTime now() {
        return LocalDateTime.now(clock);
    }

    private static boolean blank(String s) {
        return s == null || s.isBlank();
    }

    private static String trim(String s) {
        return blank(s) ? null : s.trim();
    }

    private static AppException bad(String m) { return new AppException(HttpStatus.BAD_REQUEST, m); }

    private static AppException conflict(String m) { return new AppException(HttpStatus.CONFLICT, m); }

    private static AppException forbidden() {
        return new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền với đơn thuê này");
    }
}
