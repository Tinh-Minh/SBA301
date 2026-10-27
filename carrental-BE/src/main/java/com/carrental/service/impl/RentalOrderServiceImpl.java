package com.carrental.service.impl;

import com.carrental.config.OrderProperties;
import com.carrental.dto.request.CreateOrderRequestDTO;
import com.carrental.dto.request.QuoteRequestDTO;
import com.carrental.dto.response.ActionLogDTO;
import com.carrental.dto.response.OrderResponseDTO;
import com.carrental.dto.response.PageResponseDTO;
import com.carrental.dto.response.PriceQuoteDTO;
import com.carrental.entity.CarSlot;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Voucher;
import com.carrental.enums.OrderAction;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CarSlotRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.ActionLogService;
import com.carrental.service.CurrentUserService;
import com.carrental.service.PricingService;
import com.carrental.service.RentalOrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class RentalOrderServiceImpl implements RentalOrderService {

    private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyMMdd");
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RentalOrderRepository rentalOrderRepository;
    private final CarSlotRepository carSlotRepository;
    private final VoucherRepository voucherRepository;
    private final PricingService pricingService;
    private final ActionLogService actionLogService;
    private final CurrentUserService currentUserService;
    private final OrderProperties orderProperties;
    private final Clock clock;

    // ------------------------------------------------------------------ báo giá & tạo đơn

    @Override
    @Transactional(readOnly = true)
    public PriceQuoteDTO quote(QuoteRequestDTO request) {
        return run("báo giá", request.getCarSlotId(), () -> {
            Customer renter = currentUserService.getCurrentUser();
            CarSlot slot = findSlot(request.getCarSlotId());
            ensureNotOwnCar(slot, renter);
            return pricingService.quote(slot, request.getRentalType(), request.getStartTime(),
                    request.getEndTime(), request.getVoucherCode(), renter.getId());
        });
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        log.info("Tạo đơn thuê slotId={}, rentalType={}, start={}, end={}",
                request.getCarSlotId(), request.getRentalType(), request.getStartTime(), request.getEndTime());
        return run("tạo đơn thuê", request.getCarSlotId(), () -> {
            Customer renter = currentUserService.getCurrentUser();
            CarSlot slot = findSlot(request.getCarSlotId());
            ensureNotOwnCar(slot, renter);

            PriceQuoteDTO quote = pricingService.quote(slot, request.getRentalType(), request.getStartTime(),
                    request.getEndTime(), request.getVoucherCode(), renter.getId());

            // Chống trùng lịch ở tầng service (DB còn EXCLUDE rental_orders_no_overlap làm lớp cuối).
            if (rentalOrderRepository.existsOverlapping(slot.getCar().getId(), request.getStartTime(),
                    request.getEndTime(), OrderStatus.HOLDING_SCHEDULE)) {
                throw new AppException(HttpStatus.CONFLICT, "Xe đã có người đặt trong khoảng thời gian này");
            }

            Voucher voucher = null;
            if (quote.getVoucherId() != null) {
                // Tăng lượt dùng nguyên tử: nếu vừa có người dùng hết lượt thì báo lỗi.
                if (voucherRepository.increaseUsage(quote.getVoucherId()) == 0) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Voucher đã hết lượt sử dụng");
                }
                voucher = voucherRepository.getReferenceById(quote.getVoucherId());
            }

            LocalDateTime now = LocalDateTime.now(clock);
            LocalDateTime deadline = now.plusMinutes(orderProperties.getConfirmTimeoutMinutes());
            if (deadline.isAfter(request.getStartTime())) {
                deadline = request.getStartTime();
            }

            RentalOrder order = RentalOrder.builder()
                    .orderCode(generateOrderCode(now))
                    .customer(renter)
                    .car(slot.getCar())
                    .carSlot(slot)
                    .voucher(voucher)
                    .rentalType(quote.getRentalType())
                    .startTime(quote.getStartTime())
                    .endTime(quote.getEndTime())
                    .unitPrice(quote.getUnitPrice())
                    .quantity(quote.getQuantity())
                    .rentalAmount(quote.getRentalAmount())
                    .discountAmount(quote.getDiscountAmount())
                    .totalAmount(quote.getTotalAmount())
                    .depositAmount(quote.getDepositAmount())
                    .status(OrderStatus.PENDING)
                    .paymentStatus(PaymentStatus.UNPAID)
                    .expiresAt(deadline)
                    .note(request.getNote())
                    .commissionRate(orderProperties.getCommissionRate())
                    .build();
            order.setCreatedAt(now);
            order.setUpdatedAt(now);
            order = rentalOrderRepository.saveAndFlush(order);

            actionLogService.log(order, renter, OrderAction.CREATE, null, OrderStatus.PENDING,
                    "Tạo đơn " + order.getOrderCode());
            log.info("Tạo đơn thuê thành công id={}, code={}", order.getId(), order.getOrderCode());
            return OrderResponseDTO.fromEntity(order);
        });
    }

    // ------------------------------------------------------------------ xem đơn

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long orderId) {
        return run("xem đơn thuê", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            RentalOrder order = findOrder(orderId);
            ensureCanView(order, user);
            return OrderResponseDTO.fromEntity(order);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getMyRentals(OrderStatus status, Pageable pageable) {
        return run("xem đơn đã thuê", null, () -> {
            Customer user = currentUserService.getCurrentUser();
            return PageResponseDTO.fromPage(rentalOrderRepository.findByRenter(user.getId(), status, pageable)
                    .map(OrderResponseDTO::fromEntity));
        });
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getOrdersOfMyCars(OrderStatus status, Pageable pageable) {
        return run("xem đơn trên xe của tôi", null, () -> {
            Customer user = currentUserService.getCurrentUser();
            return PageResponseDTO.fromPage(rentalOrderRepository.findByOwner(user.getId(), status, pageable)
                    .map(OrderResponseDTO::fromEntity));
        });
    }

    /** Chỉ admin gọi được: quyền được kiểm tra bằng @PreAuthorize ở controller. */
    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getAllOrders(OrderStatus status, Pageable pageable) {
        return run("xem toàn bộ đơn", null, () -> PageResponseDTO.fromPage(
                rentalOrderRepository.findAllByStatus(status, pageable).map(OrderResponseDTO::fromEntity)));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActionLogDTO> getOrderLogs(Long orderId) {
        return run("xem lịch sử đơn", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            ensureCanView(findOrder(orderId), user);
            return actionLogService.getLogsOfOrder(orderId);
        });
    }

    // ------------------------------------------------------------------ vòng đời đơn

    @Override
    @Transactional
    public OrderResponseDTO confirmOrder(Long orderId, String note) {
        log.info("Chủ xe xác nhận đơn id={}", orderId);
        return run("xác nhận đơn", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            RentalOrder order = loadOrderAsOwner(user, orderId, "xác nhận");
            LocalDateTime now = LocalDateTime.now(clock);
            // Kiểm tra hạn trước khi đổi trạng thái: job EXPIRED chạy định kỳ nên đơn quá hạn
            // có thể vẫn đang PENDING trong vài giây, không được để chủ xe xác nhận kịp.
            if (order.getStatus() == OrderStatus.PENDING
                    && order.getExpiresAt() != null && !now.isBefore(order.getExpiresAt())) {
                throw new AppException(HttpStatus.CONFLICT, "Đơn đã quá hạn xác nhận");
            }
            OrderStatus from = changeStatus(order, OrderStatus.CONFIRMED);
            order.setConfirmedAt(now);
            rentalOrderRepository.saveAndFlush(order);
            actionLogService.log(order, user, OrderAction.CONFIRM, from, OrderStatus.CONFIRMED, note);
            return OrderResponseDTO.fromEntity(order);
        });
    }

    @Override
    @Transactional
    public OrderResponseDTO rejectOrder(Long orderId, String reason) {
        log.info("Chủ xe từ chối đơn id={}", orderId);
        return run("từ chối đơn", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            RentalOrder order = loadOrderAsOwner(user, orderId, "từ chối");
            requireReason(reason, "từ chối");
            OrderStatus from = changeStatus(order, OrderStatus.REJECTED);
            order.setCancelReason(reason.trim());
            releaseVoucher(order);
            rentalOrderRepository.saveAndFlush(order);
            actionLogService.log(order, user, OrderAction.REJECT, from, OrderStatus.REJECTED, reason);
            return OrderResponseDTO.fromEntity(order);
        });
    }

    @Override
    @Transactional
    public OrderResponseDTO cancelOrder(Long orderId, String reason) {
        log.info("Huỷ đơn id={}", orderId);
        return run("huỷ đơn", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            RentalOrder order = findOrder(orderId);
            boolean renter = order.isRenter(user);
            if (!renter && !order.isOwner(user) && !currentUserService.isAdmin(user)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền huỷ đơn này");
            }
            // Người thuê huỷ không cần lý do; chủ xe/admin huỷ phải ghi rõ lý do.
            if (!renter) {
                requireReason(reason, "huỷ");
            }
            // Enum cũng chặn ONGOING -> CANCELLED, kiểm tra riêng ở đây để báo lý do cụ thể hơn.
            if (order.getStatus() == OrderStatus.ONGOING) {
                throw new AppException(HttpStatus.CONFLICT, "Xe đã được bàn giao, không thể huỷ đơn");
            }
            OrderStatus from = changeStatus(order, OrderStatus.CANCELLED);
            order.setCancelledAt(LocalDateTime.now(clock));
            order.setCancelledBy(user);
            order.setCancelReason(reason == null || reason.isBlank() ? null : reason.trim());
            releaseVoucher(order);
            rentalOrderRepository.saveAndFlush(order);
            actionLogService.log(order, user, OrderAction.CANCEL, from, OrderStatus.CANCELLED, reason);
            return OrderResponseDTO.fromEntity(order);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> findOverduePendingOrderIds() {
        return run("tìm đơn quá hạn xác nhận", null, () -> rentalOrderRepository
                .findByStatusAndExpiresAtBefore(OrderStatus.PENDING, LocalDateTime.now(clock))
                .stream().map(RentalOrder::getId).toList());
    }

    @Override
    @Transactional
    public boolean expireOrder(Long orderId) {
        return run("chuyển đơn sang EXPIRED", orderId, () -> {
            RentalOrder order = findOrder(orderId);
            LocalDateTime now = LocalDateTime.now(clock);
            // Kiểm tra lại: chủ xe có thể vừa xác nhận, hoặc job chạy chồng lần trước.
            if (order.getStatus() != OrderStatus.PENDING
                    || order.getExpiresAt() == null || order.getExpiresAt().isAfter(now)) {
                return false;
            }
            log.info("Chuyển đơn quá hạn sang EXPIRED id={}", orderId);
            OrderStatus from = changeStatus(order, OrderStatus.EXPIRED);
            releaseVoucher(order);
            rentalOrderRepository.saveAndFlush(order);
            actionLogService.log(order, null, OrderAction.EXPIRE, from, OrderStatus.EXPIRED,
                    "Chủ xe không xác nhận trước " + order.getExpiresAt());
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

    /** Đổi trạng thái theo luật trong enum OrderStatus; trả về trạng thái cũ để ghi log. */
    private static OrderStatus changeStatus(RentalOrder order, OrderStatus target) {
        OrderStatus from = order.getStatus();
        from.validateTransitionTo(target);
        order.setStatus(target);
        return from;
    }

    /** Lấy đơn và bắt buộc người gọi là chủ xe của đơn (dùng cho xác nhận/từ chối). */
    private RentalOrder loadOrderAsOwner(Customer user, Long orderId, String action) {
        RentalOrder order = findOrder(orderId);
        if (!order.isOwner(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe mới được " + action + " đơn");
        }
        return order;
    }

    private void releaseVoucher(RentalOrder order) {
        if (order.getVoucher() != null) {
            voucherRepository.decreaseUsage(order.getVoucher().getId());
        }
    }

    private static void requireReason(String reason, String action) {
        if (reason == null || reason.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do " + action + " đơn");
        }
    }

    private CarSlot findSlot(Long slotId) {
        return carSlotRepository.findById(slotId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Slot không tồn tại (id=" + slotId + ")"));
    }

    private RentalOrder findOrder(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn thuê không tồn tại (id=" + orderId + ")"));
    }

    private static void ensureNotOwnCar(CarSlot slot, Customer renter) {
        if (Objects.equals(slot.getCar().getOwner().getId(), renter.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn không thể thuê xe của chính mình");
        }
    }

    private void ensureCanView(RentalOrder order, Customer user) {
        if (!order.isRenter(user) && !order.isOwner(user) && !currentUserService.isAdmin(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đơn này");
        }
    }

    private String generateOrderCode(LocalDateTime now) {
        for (int attempt = 0; attempt < 5; attempt++) {
            StringBuilder sb = new StringBuilder("RO").append(now.format(CODE_DATE));
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!rentalOrderRepository.existsByOrderCode(code)) {
                return code;
            }
        }
        throw new AppException(HttpStatus.CONFLICT, "Không sinh được mã đơn, vui lòng thử lại");
    }
}
