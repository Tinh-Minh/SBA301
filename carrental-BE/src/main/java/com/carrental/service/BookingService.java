package com.carrental.service;

import com.carrental.dto.booking.BookingDtos.*;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.CarImage;
import com.carrental.entity.Customer;
import com.carrental.entity.Handover;
import com.carrental.entity.HandoverItem;
import com.carrental.entity.Transaction;
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
import com.carrental.enums.PaymentMethod;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.Role;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.HandoverRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.TransactionRepository;
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
public class BookingService {

    public static final Set<BookingStatus> HOLDING = EnumSet.of(BookingStatus.CONFIRMED,
            BookingStatus.PICKUP_PENDING, BookingStatus.IN_PROGRESS, BookingStatus.RETURN_PENDING);
    private static final Duration MIN_LEAD = Duration.ofHours(1);
    private static final int MAX_ADVANCE_DAYS = 90;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BookingRepository bookingRepository;
    private final HandoverRepository handoverRepository;
    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final ReviewRepository reviewRepository;
    private final VoucherRepository voucherRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final CarSafetyService carSafetyService;
    private final PublicImageStorageService publicImageStorageService;
    private final Clock clock;

    // ================================================================== báo giá / lịch

    @Transactional(readOnly = true)
    public QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt) {
        return quote(carId, pickupAt, returnAt, null);
    }

    @Transactional(readOnly = true)
    public QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, String voucherCode) {
        Car car = publicCar(carId);
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

    @Transactional(readOnly = true)
    public List<BusyRange> availability(Long carId) {
        publicCar(carId);
        return bookingRepository.findUpcomingForCar(carId, now(), HOLDING).stream()
                .map(b -> new BusyRange(b.getPickupAt(), b.getReturnAt())).toList();
    }

    /** Id các xe đã kín lịch trong khoảng thời gian (dùng cho tìm kiếm). */
    @Transactional(readOnly = true)
    public Set<Long> busyCarIds(LocalDateTime from, LocalDateTime to) {
        return new HashSet<>(bookingRepository.findBusyCarIds(from, to, HOLDING));
    }

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

    @Transactional
    public BookingResponse create(CreateBookingRequest request) {
        Customer customer = currentUserService.getCurrentUser();
        if (customer.getRole() == Role.ADMIN) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản quản trị không thể đặt xe");
        }
        Car car = carRepository.findWithOwnerById(request.carId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + request.carId()));
        if (car.getStatus() != CarStatus.ACTIVE || car.getListingStatus() != ListingStatus.LISTED) {
            throw new AppException(HttpStatus.CONFLICT, "Xe hiện không nhận đặt (chưa duyệt hoặc tin đăng đã ẩn)");
        }
        if (car.getOwner().getId().equals(customer.getId())) {
            throw bad("Bạn không thể đặt xe của chính mình");
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
        if (voucher != null && voucherRepository.increaseUsage(voucher.getId()) == 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
        }
        PaymentStatus initialDepositStatus = (q.depositAmount() == null || q.depositAmount().compareTo(BigDecimal.ZERO) <= 0)
                ? PaymentStatus.NOT_REQUIRED : PaymentStatus.UNPAID;

        Booking booking = Booking.builder()
                .bookingCode(newCode())
                .car(car).customer(customer).owner(car.getOwner())
                .pickupAt(request.pickupAt()).returnAt(request.returnAt())
                .rentalDays(q.rentalDays()).rentalHours(q.rentalHours())
                .pricePerDay(q.pricePerDay()).pricePerHour(q.pricePerHour())
                .dayAmount(q.dayAmount()).hourAmount(q.hourAmount()).rentalAmount(q.rentalAmount())
                .voucher(voucher)
                .discountAmount(discount)
                .depositAmount(q.depositAmount())
                .depositStatus(initialDepositStatus)
                .kmLimitPerDay(car.getKmLimitPerDay()).extraKmFee(car.getExtraKmFee())
                .lateFeePerHour(car.getLateFeePerHour())
                .contactPhone(blank(request.contactPhone()) ? customer.getPhone() : request.contactPhone().trim())
                .customerNote(trim(request.customerNote()))
                .build();
        log.info("Tạo yêu cầu thuê xe carId={}, customerId={}", car.getId(), customer.getId());
        return toResponse(bookingRepository.saveAndFlush(booking));
    }

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
        if (b.getStatus() != BookingStatus.REQUESTED && b.getStatus() != BookingStatus.CONFIRMED
                && !(admin && b.getStatus().isOpen())) {
            throw conflict("Chỉ huỷ được đơn chưa bàn giao xe");
        }
        if (!admin && b.getStatus() == BookingStatus.CONFIRMED && !b.getPickupAt().isAfter(now())) {
            throw conflict("Đã quá giờ nhận xe, không thể tự huỷ đơn. Vui lòng liên hệ hỗ trợ");
        }
        b.setStatus(BookingStatus.CANCELLED);
        b.setCancelReason(reason.trim());
        b.setCancelledBy(admin ? "ADMIN" : isOwner ? "OWNER" : "CUSTOMER");

        // Hoàn lại lượt voucher nếu đơn bị hủy
        if (b.getVoucher() != null) {
            voucherRepository.decreaseUsage(b.getVoucher().getId());
        }

        // Hoàn tiền cọc nếu đơn đã cọc
        if (b.getDepositStatus() == PaymentStatus.PAID && b.getDepositAmount() != null && b.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal refundAmount = b.getDepositAmount();
            if (isCustomer && !admin && !isOwner) {
                // Khách tự hủy trong vòng 24 giờ trước giờ nhận xe: hoàn 70% cọc
                if (b.getPickupAt().isBefore(now().plusHours(24))) {
                    refundAmount = b.getDepositAmount().multiply(BigDecimal.valueOf(70)).divide(BigDecimal.valueOf(100), 0, RoundingMode.HALF_UP);
                }
            }
            b.setDepositStatus(PaymentStatus.REFUNDED);
            Transaction refundTx = Transaction.builder()
                    .booking(b)
                    .transactionType(TransactionType.BOOKING_REFUND)
                    .amount(refundAmount)
                    .method(PaymentMethod.VNPAY)
                    .status(TransactionStatus.SUCCESS)
                    .providerRef("REFUND_BK_" + b.getId() + "_" + System.currentTimeMillis())
                    .paidAt(now())
                    .build();
            transactionRepository.save(refundTx);
            log.info("Hoàn cọc đơn thuê bookingId={}, amount={}, refundAmount={}", b.getId(), b.getDepositAmount(), refundAmount);
        }

        return toResponse(bookingRepository.saveAndFlush(b));
    }

    // ================================================================== chủ xe

    /** Chủ xe xác nhận đã gọi/nhắn cho khách và ghi lại nội dung trao đổi. */
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
        carRepository.findWithLockById(b.getCar().getId());
        if (!bookingRepository.findOverlapping(b.getCar().getId(), b.getPickupAt(), b.getReturnAt(), HOLDING).isEmpty()) {
            throw conflict("Xe đã có đơn khác được xác nhận trùng thời gian");
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
            other.setStatus(BookingStatus.REJECTED);
            other.setRejectReason("Xe đã được xác nhận cho khách khác trong khung giờ này");
            if (other.getVoucher() != null) {
                voucherRepository.decreaseUsage(other.getVoucher().getId());
            }
        }
        bookingRepository.saveAll(competing);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    @Transactional
    public BookingResponse reject(Long id, String reason) {
        Booking b = ownedBooking(id);
        requireStatus(b, BookingStatus.REQUESTED);
        b.setStatus(BookingStatus.REJECTED);
        b.setRejectReason(reason.trim());
        if (b.getVoucher() != null) {
            voucherRepository.decreaseUsage(b.getVoucher().getId());
        }
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    // ================================================================== biên bản bàn giao

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
        if (type == HandoverType.PICKUP && b.getPickupAt().minusHours(24).isAfter(now())) {
            throw conflict("Chỉ lập biên bản nhận xe trong vòng 24 giờ trước giờ nhận xe");
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
            settle(b, request.odometerKm(), request.otherFeeAmount(), request.otherFeeNote());
        }
        b.setStatus(type == HandoverType.PICKUP ? BookingStatus.PICKUP_PENDING : BookingStatus.RETURN_PENDING);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /** Khách xem từng mục: đồng ý, hoặc yêu cầu chủ xe sửa kèm ghi chú. */
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
        Map<Long, ItemDecision> decisions = request.decisions().stream()
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
        if (anyDisputed) {
            h.setStatus(HandoverStatus.DISPUTED);
        } else {
            h.setStatus(HandoverStatus.CONFIRMED);
            h.setConfirmedAt(now());
            if (type == HandoverType.PICKUP) {
                b.setStatus(BookingStatus.IN_PROGRESS);
                b.setPickedUpAt(now());
                b.setPickupOdometerKm(h.getOdometerKm());
            } else {
                b.setStatus(BookingStatus.COMPLETED);
                b.setReturnedAt(now());
                b.setCompletedAt(now());
            }
        }
        handoverRepository.saveAndFlush(h);
        return toResponse(bookingRepository.saveAndFlush(b));
    }

    /** Chủ xe sửa đúng các mục khách yêu cầu rồi gửi lại cho khách. */
    @Transactional
    public BookingResponse reviseHandover(Long id, HandoverType type, ReviseHandoverRequest request, List<MultipartFile> photos) {
        Booking b = ownedBooking(id);
        Handover h = handover(id, type);
        if (h.getStatus() != HandoverStatus.DISPUTED) {
            throw conflict("Biên bản không có mục nào cần sửa");
        }
        if (photos == null || photos.size() != request.revisions().size()) {
            throw bad("Số lượng ảnh tải lên (" + (photos != null ? photos.size() : 0) + ") phải khớp với số mục cần sửa (" + request.revisions().size() + ")");
        }
        Map<Long, HandoverItem> disputed = new HashMap<>();
        for (HandoverItem item : h.getItems()) {
            if (item.getStatus() == HandoverItemStatus.DISPUTED) {
                disputed.put(item.getId(), item);
            }
        }
        Set<Long> revised = request.revisions().stream().map(ItemRevision::itemId).collect(Collectors.toSet());
        if (!revised.equals(disputed.keySet())) {
            throw bad("Vui lòng sửa đúng và đủ các mục khách yêu cầu");
        }
        List<String> storedUrls = publicImageStorageService.storeImages(photos);
        for (int i = 0; i < request.revisions().size(); i++) {
            ItemRevision r = request.revisions().get(i);
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
            settle(b, h.getOdometerKm(), b.getOtherFeeAmount(), b.getOtherFeeNote());
            bookingRepository.saveAndFlush(b);
        }
        return toResponse(b);
    }

    /** Chốt phí phát sinh khi trả xe: quá km, trễ giờ, phí khác. */
    private void settle(Booking b, int returnOdometer, BigDecimal otherFee, String otherFeeNote) {
        LocalDateTime now = now();
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
        b.setExtraKmAmount(extraKm);
        b.setLateAmount(late);
        b.setOtherFeeAmount(other);
        b.setOtherFeeNote(trim(otherFeeNote));

        BigDecimal discount = b.getDiscountAmount() != null ? b.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal actualRental = b.getRentalAmount().subtract(discount).max(BigDecimal.ZERO);
        BigDecimal totalTripCost = actualRental.add(extraKm).add(late).add(other);

        // Trừ tiền cọc nếu khách đã thanh toán cọc
        BigDecimal paidDeposit = (b.getDepositStatus() == PaymentStatus.PAID && b.getDepositAmount() != null)
                ? b.getDepositAmount() : BigDecimal.ZERO;
        BigDecimal remainingToPay = totalTripCost.subtract(paidDeposit).max(BigDecimal.ZERO);

        b.setFinalAmount(remainingToPay);
    }

    // ================================================================== đọc

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

    @Transactional(readOnly = true)
    public List<BookingResponse> mineAsCustomer() {
        Customer user = currentUserService.getCurrentUser();
        return toResponses(bookingRepository.findAllByCustomerIdOrderByPickupAtDesc(user.getId()));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> mineAsOwner() {
        Customer user = currentUserService.getCurrentUser();
        CurrentUserService.requireVerifiedOwner(user);
        return toResponses(bookingRepository.findAllByOwnerIdOrderByPickupAtDesc(user.getId()));
    }

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
    @Transactional(readOnly = true)
    public boolean hasCompletedTrip(Long carId, Long customerId) {
        return bookingRepository.existsByCarIdAndCustomerIdAndStatus(carId, customerId, BookingStatus.COMPLETED);
    }

    // ================================================================== tự động

    /** Yêu cầu chưa được chủ xe nhận mà đã tới giờ nhận xe thì hết hạn. */
    @Transactional
    public int expireStaleRequests() {
        List<Booking> stale = bookingRepository.findAllByStatusAndPickupAtBefore(BookingStatus.REQUESTED, now());
        for (Booking b : stale) {
            b.setStatus(BookingStatus.EXPIRED);
            if (b.getVoucher() != null) {
                voucherRepository.decreaseUsage(b.getVoucher().getId());
            }
        }
        bookingRepository.saveAll(stale);
        return stale.size();
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

    public BookingResponse toResponse(Booking b) {
        String image = carImageRepository.findByCarIdAndIsPrimaryTrue(b.getCar().getId())
                .map(CarImage::getImageUrl).orElse(null);
        boolean reviewed = b.getStatus() == BookingStatus.COMPLETED
                && reviewRepository.existsByCarIdAndCustomerId(b.getCar().getId(), b.getCustomer().getId());
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
