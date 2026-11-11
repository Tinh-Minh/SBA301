package com.carrental.service.impl;

import com.carrental.config.SubscriptionProperties;
import com.carrental.dto.request.CreateSubscriptionRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.SubscriptionPackageOption;
import com.carrental.dto.response.SubscriptionQuoteResponse;
import com.carrental.dto.response.SubscriptionResponse;
import com.carrental.entity.Car;
import com.carrental.entity.CarSubscription;
import com.carrental.entity.Customer;
import com.carrental.entity.ListingPackage;
import com.carrental.entity.Transaction;
import com.carrental.entity.Voucher;
import com.carrental.enums.CarStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.CarSubscriptionService;
import com.carrental.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarSubscriptionServiceImpl implements CarSubscriptionService {

    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);
    private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final CarSubscriptionRepository subscriptionRepository;
    private final CarRepository carRepository;
    private final ListingPackageRepository listingPackageRepository;
    private final VoucherRepository voucherRepository;
    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final SubscriptionProperties subscriptionProperties;
    private final Clock clock;

    // ------------------------------------------------------------------ gói cước & báo giá

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPackageOption> getPackages() {
        return run("xem gói cước", null, () -> listingPackageRepository.findAllByIsActiveTrueOrderByPriorityLevelDesc()
                .stream().map(SubscriptionPackageOption::from).toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionQuoteResponse quote(CreateSubscriptionRequest request) {
        return run("báo giá gói đăng tin", request.getCarId(), () -> {
            Customer owner = currentUserService.getCurrentUser();
            Car car = loadOwnCar(request.getCarId(), owner);
            ensureCarCanBuy(car);
            ListingPackage listingPackage = loadPackage(request.getPackageId());
            Voucher voucher = resolveVoucher(request.getVoucherCode(), listingPackage.getPrice(), owner);
            BigDecimal discount = calculateDiscount(voucher, listingPackage.getPrice());
            return new SubscriptionQuoteResponse(car.getId(), listingPackage.getId(), listingPackage.getName(),
                    listingPackage.getDurationDays(), voucher == null ? null : voucher.getCode(),
                    listingPackage.getPrice(), discount, listingPackage.getPrice().subtract(discount),
                    listingPackage.getSlotCount() != null ? listingPackage.getSlotCount() : 1,
                    listingPackage.getDurationDaysPerSlot() != null ? listingPackage.getDurationDaysPerSlot() : 7);
        });
    }

    // ------------------------------------------------------------------ mua & kích hoạt

    @Override
    @Transactional
    public SubscriptionResponse createSubscription(CreateSubscriptionRequest request) {
        log.info("Tạo yêu cầu mua gói carId={}, packageId={}", request.getCarId(), request.getPackageId());
        return run("tạo yêu cầu mua gói", request.getCarId(), () -> {
            Customer owner = currentUserService.getCurrentUser();
            Car car = loadOwnCar(request.getCarId(), owner);
            ensureCarCanBuy(car);
            ListingPackage listingPackage = loadPackage(request.getPackageId());
            Voucher voucher = resolveVoucher(request.getVoucherCode(), listingPackage.getPrice(), owner);
            BigDecimal discount = calculateDiscount(voucher, listingPackage.getPrice());

            // Tăng lượt dùng nguyên tử: nếu vừa có người dùng hết lượt thì báo lỗi.
            if (voucher != null && voucherRepository.increaseUsage(voucher.getId()) == 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
            }

            LocalDateTime now = LocalDateTime.now(clock);
            int slotCount = listingPackage.getSlotCount() != null ? listingPackage.getSlotCount() : 1;
            int slotDays = listingPackage.getDurationDaysPerSlot() != null ? listingPackage.getDurationDaysPerSlot() : 7;
            CarSubscription subscription = subscriptionRepository.saveAndFlush(CarSubscription.builder()
                    .subscriptionCode(generateCode(now))
                    .customer(owner)
                    .car(car)
                    .listingPackage(listingPackage)
                    .voucher(voucher)
                    .packagePrice(listingPackage.getPrice())
                    .discountAmount(discount)
                    .totalAmount(listingPackage.getPrice().subtract(discount))
                    .totalSlots(slotCount)
                    .remainingSlots(slotCount)
                    .durationDaysPerSlot(slotDays)
                    .status(SubscriptionStatus.PENDING_PAYMENT)
                    .paymentStatus(PaymentStatus.UNPAID)
                    .build());

            // Voucher giảm hết tiền thì không có gì để thanh toán qua cổng (giao dịch phải có amount > 0).
            if (subscription.getTotalAmount().signum() == 0) {
                activate(subscription, now);
            }
            log.info("Tạo yêu cầu mua gói thành công id={}, code={}", subscription.getId(), subscription.getSubscriptionCode());
            return toResponse(subscription, now);
        });
    }

    @Override
    @Transactional
    public void activateSubscription(Long subscriptionId) {
        log.info("Kích hoạt gói đăng tin id={}", subscriptionId);
        run("kích hoạt gói đăng tin", subscriptionId, () -> {
            CarSubscription subscription = findSubscription(subscriptionId);
            if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                activate(subscription, LocalDateTime.now(clock));
            }
            return null;
        });
    }

    @Override
    @Transactional
    public SubscriptionResponse activateNextSlot(Long subscriptionId) {
        log.info("Kích hoạt slot tiếp theo cho gói đăng tin id={}", subscriptionId);
        return run("kích hoạt slot tiếp theo", subscriptionId, () -> {
            Customer user = currentUserService.getCurrentUser();
            CarSubscription subscription = findSubscription(subscriptionId);
            if (!isBuyer(subscription, user) && !currentUserService.isAdmin(user)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền kích hoạt slot của gói này");
            }
            if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin không trong trạng thái kích hoạt");
            }
            if (subscription.getRemainingSlots() == null || subscription.getRemainingSlots() <= 0) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin đã sử dụng hết toàn bộ slot");
            }

            LocalDateTime now = LocalDateTime.now(clock);
            if (subscription.getCurrentSlotEndDate() != null && subscription.getCurrentSlotEndDate().isAfter(now)) {
                throw new AppException(HttpStatus.CONFLICT, "Slot hiện tại vẫn còn hiệu lực đến " + subscription.getCurrentSlotEndDate());
            }

            int slotDays = subscription.getDurationDaysPerSlot() != null ? subscription.getDurationDaysPerSlot() : 7;
            subscription.setRemainingSlots(subscription.getRemainingSlots() - 1);
            subscription.setCurrentSlotStartDate(now);
            subscription.setCurrentSlotEndDate(now.plusDays(slotDays));

            Car car = subscription.getCar();
            car.setListingStatus(ListingStatus.LISTED);
            car.setCurrentSubscriptionId(subscription.getId());
            log.info("Kích hoạt slot thành công xe={}, còn lại {} slots", car.getLicensePlate(), subscription.getRemainingSlots());
            return SubscriptionResponse.from(subscription, now);
        });
    }

    // ------------------------------------------------------------------ xem gói

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SubscriptionResponse> getMySubscriptions(Pageable pageable) {
        return run("xem gói đăng tin của tôi", null, () -> {
            Customer user = currentUserService.getCurrentUser();
            LocalDateTime now = LocalDateTime.now(clock);
            return PageResponse.from(subscriptionRepository.findAllByCustomerId(user.getId(), pageable)
                    .map(subscription -> toResponse(subscription, now)));
        });
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getSubscriptionDetail(Long id) {
        return run("xem chi tiết gói đăng tin", id, () -> {
            Customer user = currentUserService.getCurrentUser();
            CarSubscription subscription = findSubscription(id);
            if (!isBuyer(subscription, user) && !currentUserService.isAdmin(user)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem gói đăng tin này");
            }
            return toResponse(subscription, LocalDateTime.now(clock));
        });
    }

    /** Chỉ admin gọi được: quyền được kiểm tra bằng @PreAuthorize ở controller. */
    @Override
    @Transactional(readOnly = true)
    public PageResponse<SubscriptionResponse> getAllSubscriptions(SubscriptionStatus status, Pageable pageable) {
        return run("xem toàn bộ gói đăng tin", null, () -> {
            LocalDateTime now = LocalDateTime.now(clock);
            return PageResponse.from(subscriptionRepository.search(status, pageable)
                    .map(subscription -> toResponse(subscription, now)));
        });
    }

    // ------------------------------------------------------------------ huỷ

    @Override
    @Transactional
    public SubscriptionResponse cancelSubscription(Long id) {
        log.info("Huỷ gói đăng tin id={}", id);
        return run("huỷ gói đăng tin", id, () -> {
            Customer user = currentUserService.getCurrentUser();
            CarSubscription subscription = findSubscription(id);
            boolean admin = currentUserService.isAdmin(user);
            if (!admin && !isBuyer(subscription, user)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền huỷ gói đăng tin này");
            }
            if (!admin && subscription.getStatus() == SubscriptionStatus.ACTIVE) {
                throw new AppException(HttpStatus.FORBIDDEN, "Gói đã kích hoạt chỉ quản trị viên mới được huỷ");
            }
            cancel(subscription);
            return toResponse(subscription, LocalDateTime.now(clock));
        });
    }

    // ------------------------------------------------------------------ job hết hạn

    @Override
    @Transactional(readOnly = true)
    public List<Long> findExpiredSubscriptionIds() {
        return run("tìm gói hết hạn", null, () -> subscriptionRepository
                .findActiveEligibleForExpiration(SubscriptionStatus.ACTIVE, LocalDateTime.now(clock))
                .stream().map(CarSubscription::getId).toList());
    }

    @Override
    @Transactional
    public boolean expireSubscription(Long id) {
        return run("chuyển gói sang EXPIRED", id, () -> {
            CarSubscription subscription = findSubscription(id);
            if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                return false;
            }
            LocalDateTime now = LocalDateTime.now(clock);
            boolean slotExpired = subscription.getCurrentSlotEndDate() != null && !subscription.getCurrentSlotEndDate().isAfter(now);
            boolean overallExpired = subscription.getEndDate() != null && !subscription.getEndDate().isAfter(now);

            if (subscription.getCurrentSlotEndDate() == null && !overallExpired) {
                return false;
            }
            if (!slotExpired && !overallExpired) {
                return false;
            }

            Car car = subscription.getCar();
            // Nếu còn slots và chưa quá hạn tổng thể: chuyển xe sang UNLISTED, gói vẫn ACTIVE
            if (subscription.getRemainingSlots() != null && subscription.getRemainingSlots() > 0 && !overallExpired) {
                subscription.setCurrentSlotStartDate(null);
                subscription.setCurrentSlotEndDate(null);
                if (subscription.getId().equals(car.getCurrentSubscriptionId())) {
                    car.setListingStatus(ListingStatus.UNLISTED);
                }
                log.info("Slot hiện tại của gói {} (xe {}) đã kết thúc -> Xe chuyển về UNLISTED, còn lại {} slot",
                        subscription.getSubscriptionCode(), car.getLicensePlate(), subscription.getRemainingSlots());
                return true;
            }

            subscription.getStatus().validateTransitionTo(SubscriptionStatus.EXPIRED);
            subscription.setStatus(SubscriptionStatus.EXPIRED);
            if (subscription.getId().equals(car.getCurrentSubscriptionId())) {
                car.setListingStatus(ListingStatus.EXPIRED);
            }
            log.info("Gói đăng tin {} của xe {} đã hết hạn -> Đã tạm ẩn bài đăng",
                    subscription.getSubscriptionCode(), car.getLicensePlate());
            return true;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> findOverduePendingIds() {
        return run("tìm gói quá hạn thanh toán", null, () -> subscriptionRepository
                .findByStatusAndCreatedAtBefore(SubscriptionStatus.PENDING_PAYMENT, paymentCutoff())
                .stream().map(CarSubscription::getId).toList());
    }

    @Override
    @Transactional
    public boolean cancelOverduePending(Long id) {
        return run("huỷ gói quá hạn thanh toán", id, () -> {
            CarSubscription subscription = findSubscription(id);
            // Kiểm tra lại: chủ xe có thể vừa thanh toán xong đúng lúc job chạy.
            if (subscription.getStatus() != SubscriptionStatus.PENDING_PAYMENT
                    || subscription.getCreatedAt().isAfter(paymentCutoff())) {
                return false;
            }
            cancel(subscription);
            log.info("Huỷ gói quá hạn thanh toán code={}", subscription.getSubscriptionCode());
            return true;
        });
    }

    // ------------------------------------------------------------------ helpers

    /**
     * Try/catch chung cho mọi hàm nghiệp vụ của service (quy ước nhóm mục 6):
     * lỗi nghiệp vụ ném lại nguyên; lỗi ràng buộc DB và sửa đồng thời ném lại để
     * GlobalExceptionHandler trả 409; lỗi khác bọc thành AppException 500.
     */
    private <T> T run(String action, Long id, Supplier<T> work) {
        try {
            return work.get();
        } catch (AppException e) {
            log.warn("{} thất bại id={}: {}", action, id, e.getMessage());
            throw e;
        } catch (DataIntegrityViolationException | ObjectOptimisticLockingFailureException e) {
            log.warn("{} bị từ chối do xung đột dữ liệu id={}: {}", action, id, e.getClass().getSimpleName());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi {} id={}", action, id, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể " + action);
        }
    }

    private void activate(CarSubscription subscription, LocalDateTime now) {
        subscription.getStatus().validateTransitionTo(SubscriptionStatus.ACTIVE);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setPaymentStatus(PaymentStatus.PAID);

        ListingPackage pkg = subscription.getListingPackage();
        int totalSlots = (pkg != null && pkg.getSlotCount() != null) ? pkg.getSlotCount() : 1;
        int slotDays = (pkg != null && pkg.getDurationDaysPerSlot() != null)
                ? pkg.getDurationDaysPerSlot()
                : ((pkg != null && pkg.getDurationDays() != null) ? pkg.getDurationDays() : 7);
        int totalDays = (pkg != null && pkg.getDurationDays() != null) ? pkg.getDurationDays() : (totalSlots * slotDays);

        subscription.setTotalSlots(totalSlots);
        subscription.setRemainingSlots(Math.max(0, totalSlots - 1));
        subscription.setDurationDaysPerSlot(slotDays);
        subscription.setCurrentSlotStartDate(now);
        subscription.setCurrentSlotEndDate(now.plusDays(slotDays));

        subscription.setStartDate(now);
        subscription.setEndDate(now.plusDays(totalDays));
        subscription.setActivatedAt(now);
        Car car = subscription.getCar();
        car.setListingStatus(ListingStatus.LISTED);
        car.setCurrentSubscriptionId(subscription.getId());
    }

    private void cancel(CarSubscription subscription) {
        SubscriptionStatus from = subscription.getStatus();
        from.validateTransitionTo(SubscriptionStatus.CANCELLED);
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        // Huỷ mọi giao dịch PENDING liên quan để không bị treo trạng thái chờ thanh toán trên hệ thống.
        List<Transaction> pendingTransactions = transactionRepository
                .findAllBySubscriptionIdAndStatus(subscription.getId(), TransactionStatus.PENDING);
        for (Transaction tx : pendingTransactions) {
            tx.setStatus(TransactionStatus.FAILED);
        }
        // Gói chưa thanh toán chưa dùng thật nên trả lại lượt voucher; xe chưa được gói này mở tin nên giữ nguyên.
        if (from == SubscriptionStatus.PENDING_PAYMENT) {
            if (subscription.getVoucher() != null) {
                voucherRepository.decreaseUsage(subscription.getVoucher().getId());
            }
            return;
        }
        Car car = subscription.getCar();
        if (subscription.getId().equals(car.getCurrentSubscriptionId())) {
            car.setListingStatus(ListingStatus.UNLISTED);
        }
    }

    private SubscriptionResponse toResponse(CarSubscription subscription, LocalDateTime now) {
        return SubscriptionResponse.from(subscription, now, subscriptionProperties.getPaymentTimeoutMinutes());
    }

    private LocalDateTime paymentCutoff() {
        return LocalDateTime.now(clock).minusMinutes(subscriptionProperties.getPaymentTimeoutMinutes());
    }

    private Car loadOwnCar(Long carId, Customer owner) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe (id=" + carId + ")"));
        if (!currentUserService.isOwner(car, owner)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe mới được mua gói đăng tin cho xe này");
        }
        return car;
    }

    /** Xe phải đã duyệt và chưa có gói còn hiệu lực hoặc đang chờ thanh toán (tránh trả tiền hai lần). */
    private void ensureCarCanBuy(Car car) {
        if (car.getStatus() != CarStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Xe chưa được duyệt nên chưa thể mua gói đăng tin");
        }
        if (subscriptionRepository.existsByCarIdAndStatus(car.getId(), SubscriptionStatus.ACTIVE)) {
            throw new AppException(HttpStatus.CONFLICT, "Xe đang có gói đăng tin còn hiệu lực");
        }
        if (subscriptionRepository.existsByCarIdAndStatus(car.getId(), SubscriptionStatus.PENDING_PAYMENT)) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Xe đang có yêu cầu mua gói chờ thanh toán, hãy thanh toán hoặc huỷ yêu cầu đó trước");
        }
    }

    private ListingPackage loadPackage(Long packageId) {
        ListingPackage listingPackage = listingPackageRepository.findById(packageId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đăng tin (id=" + packageId + ")"));
        if (!Boolean.TRUE.equals(listingPackage.getIsActive())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Gói đăng tin này đã ngừng bán");
        }
        return listingPackage;
    }

    private Voucher resolveVoucher(String voucherCode, BigDecimal price, Customer customer) {
        if (voucherCode == null || voucherCode.isBlank()) {
            return null;
        }
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(voucherCode.trim())
                .orElseThrow(() -> new AppException(HttpStatus.BAD_REQUEST, "Mã voucher không tồn tại"));
        LocalDateTime now = LocalDateTime.now(clock);
        if (voucher.getStatus() != VoucherStatus.ACTIVE
                || now.isBefore(voucher.getStartAt()) || !now.isBefore(voucher.getEndAt())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết hạn hoặc chưa đến thời gian sử dụng");
        }
        if (price.compareTo(voucher.getMinOrderAmount()) < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Gói chưa đạt giá trị tối thiểu "
                    + voucher.getMinOrderAmount().toPlainString() + "đ để dùng voucher");
        }
        if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
        }
        long used = subscriptionRepository.countByVoucherIdAndCustomerIdAndStatusNot(
                voucher.getId(), customer.getId(), SubscriptionStatus.CANCELLED);
        if (used >= voucher.getPerUserLimit()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã dùng hết lượt của voucher này");
        }
        return voucher;
    }

    private static BigDecimal calculateDiscount(Voucher voucher, BigDecimal price) {
        if (voucher == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal discount = voucher.getDiscountValue();
        if (voucher.getDiscountType() == DiscountType.PERCENT) {
            discount = price.multiply(voucher.getDiscountValue()).divide(HUNDRED, 0, RoundingMode.DOWN);
            if (voucher.getMaxDiscount() != null) {
                discount = discount.min(voucher.getMaxDiscount());
            }
        }
        return discount.min(price);
    }

    /** Mã dạng SUB-YYYYMMDD-XXXX; cột subscription_code có UNIQUE làm lớp chặn cuối. */
    private static String generateCode(LocalDateTime now) {
        StringBuilder random = new StringBuilder(4);
        for (int i = 0; i < 4; i++) {
            random.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return "SUB-" + now.format(CODE_DATE) + "-" + random;
    }

    private static boolean isBuyer(CarSubscription subscription, Customer user) {
        return subscription.getCustomer().getId().equals(user.getId());
    }

    private CarSubscription findSubscription(Long id) {
        return subscriptionRepository.findWithDetailsById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy gói đăng tin (id=" + id + ")"));
    }
}
