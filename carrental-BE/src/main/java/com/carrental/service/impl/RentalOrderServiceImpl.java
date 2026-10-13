package com.carrental.service.impl;

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
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ConflictException;
import com.carrental.exception.ForbiddenException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.CarSlotRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.service.ActionLogService;
import com.carrental.service.CurrentUserService;
import com.carrental.service.PricingService;
import com.carrental.service.RentalOrderService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
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
    private final Clock clock;

    /** Chủ xe có bao lâu để xác nhận đơn (không quá giờ nhận xe). */
    @Value("${app.order.confirm-timeout-minutes:1440}")
    private long confirmTimeoutMinutes;

    /** % hoa hồng nền tảng chụp vào đơn lúc tạo. */
    @Value("${app.order.commission-rate:10.00}")
    private BigDecimal commissionRate;

    public RentalOrderServiceImpl(RentalOrderRepository rentalOrderRepository,
                                  CarSlotRepository carSlotRepository,
                                  VoucherRepository voucherRepository,
                                  PricingService pricingService,
                                  ActionLogService actionLogService,
                                  CurrentUserService currentUserService,
                                  Clock clock) {
        this.rentalOrderRepository = rentalOrderRepository;
        this.carSlotRepository = carSlotRepository;
        this.voucherRepository = voucherRepository;
        this.pricingService = pricingService;
        this.actionLogService = actionLogService;
        this.currentUserService = currentUserService;
        this.clock = clock;
    }

    // ------------------------------------------------------------------ báo giá & tạo đơn

    @Override
    @Transactional(readOnly = true)
    public PriceQuoteDTO quote(QuoteRequestDTO request) {
        Customer renter = currentUserService.getCurrentUser();
        CarSlot slot = findSlot(request.getCarSlotId());
        ensureNotOwnCar(slot, renter);
        return pricingService.quote(slot, request.getRentalType(), request.getStartTime(),
                request.getEndTime(), request.getVoucherCode(), renter.getId());
    }

    @Override
    @Transactional
    public OrderResponseDTO createOrder(CreateOrderRequestDTO request) {
        Customer renter = currentUserService.getCurrentUser();
        CarSlot slot = findSlot(request.getCarSlotId());
        ensureNotOwnCar(slot, renter);

        PriceQuoteDTO quote = pricingService.quote(slot, request.getRentalType(), request.getStartTime(),
                request.getEndTime(), request.getVoucherCode(), renter.getId());

        // Chống trùng lịch ở tầng service (DB còn EXCLUDE rental_orders_no_overlap làm lớp cuối).
        if (rentalOrderRepository.existsOverlapping(slot.getCar().getId(), request.getStartTime(),
                request.getEndTime(), OrderStatus.ACTIVE_STATUSES)) {
            throw new ConflictException("Xe đã có người đặt trong khoảng thời gian này");
        }

        Voucher voucher = null;
        if (quote.getVoucherId() != null) {
            // Tăng lượt dùng nguyên tử: nếu vừa có người dùng hết lượt thì báo lỗi.
            if (voucherRepository.increaseUsage(quote.getVoucherId()) == 0) {
                throw new BadRequestException("Voucher đã hết lượt sử dụng");
            }
            voucher = voucherRepository.getReferenceById(quote.getVoucherId());
        }

        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime deadline = now.plusMinutes(confirmTimeoutMinutes);
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
                .commissionRate(commissionRate)
                .createdAt(now)
                .updatedAt(now)
                .build();
        order = rentalOrderRepository.saveAndFlush(order);

        actionLogService.log(order, renter, ActionLogService.CREATE, null, OrderStatus.PENDING,
                "Tạo đơn " + order.getOrderCode());
        return OrderResponseDTO.fromEntity(order);
    }

    // ------------------------------------------------------------------ xem đơn

    @Override
    @Transactional(readOnly = true)
    public OrderResponseDTO getOrder(Long orderId) {
        Customer user = currentUserService.getCurrentUser();
        RentalOrder order = findOrder(orderId);
        ensureCanView(order, user);
        return OrderResponseDTO.fromEntity(order);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getMyRentals(OrderStatus status, Pageable pageable) {
        Customer user = currentUserService.getCurrentUser();
        return PageResponseDTO.fromPage(rentalOrderRepository.findByRenter(user.getId(), status, pageable)
                .map(OrderResponseDTO::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getOrdersOfMyCars(OrderStatus status, Pageable pageable) {
        Customer user = currentUserService.getCurrentUser();
        return PageResponseDTO.fromPage(rentalOrderRepository.findByOwner(user.getId(), status, pageable)
                .map(OrderResponseDTO::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<OrderResponseDTO> getAllOrders(OrderStatus status, Pageable pageable) {
        Customer user = currentUserService.getCurrentUser();
        if (!currentUserService.isAdmin(user)) {
            throw new ForbiddenException("Chỉ admin được xem toàn bộ đơn");
        }
        return PageResponseDTO.fromPage(rentalOrderRepository.findAllByStatus(status, pageable)
                .map(OrderResponseDTO::fromEntity));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActionLogDTO> getOrderLogs(Long orderId) {
        Customer user = currentUserService.getCurrentUser();
        ensureCanView(findOrder(orderId), user);
        return actionLogService.getLogsOfOrder(orderId);
    }

    // ------------------------------------------------------------------ helpers

    private CarSlot findSlot(Long slotId) {
        return carSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResourceNotFoundException("Slot", slotId));
    }

    RentalOrder findOrder(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn thuê", orderId));
    }

    private void ensureNotOwnCar(CarSlot slot, Customer renter) {
        if (Objects.equals(slot.getCar().getOwner().getId(), renter.getId())) {
            throw new BadRequestException("Bạn không thể thuê xe của chính mình");
        }
    }

    boolean isRenter(RentalOrder order, Customer user) {
        return Objects.equals(order.getCustomer().getId(), user.getId());
    }

    boolean isOwner(RentalOrder order, Customer user) {
        return Objects.equals(order.getCar().getOwner().getId(), user.getId());
    }

    private void ensureCanView(RentalOrder order, Customer user) {
        if (!isRenter(order, user) && !isOwner(order, user) && !currentUserService.isAdmin(user)) {
            throw new ForbiddenException("Bạn không có quyền xem đơn này");
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
        throw new ConflictException("Không sinh được mã đơn, vui lòng thử lại");
    }
}
