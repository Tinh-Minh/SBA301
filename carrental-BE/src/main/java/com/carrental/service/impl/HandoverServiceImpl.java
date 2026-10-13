package com.carrental.service.impl;

import com.carrental.dto.request.CreateHandoverRequestDTO;
import com.carrental.dto.request.HandoverImageRequestDTO;
import com.carrental.dto.response.HandoverResponseDTO;
import com.carrental.entity.Customer;
import com.carrental.entity.HandoverImage;
import com.carrental.entity.OrderHandover;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.HandoverType;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.ConflictException;
import com.carrental.exception.ForbiddenException;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.OrderHandoverRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.service.ActionLogService;
import com.carrental.service.CurrentUserService;
import com.carrental.service.HandoverService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class HandoverServiceImpl implements HandoverService {

    private final OrderHandoverRepository handoverRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final ActionLogService actionLogService;
    private final CurrentUserService currentUserService;
    private final Clock clock;

    /** Cho phép nhận xe sớm hơn giờ đặt bao nhiêu phút. */
    @Value("${app.order.pickup-early-minutes:60}")
    private long pickupEarlyMinutes;

    /** Bật khi Function 4 đã cập nhật payment_status: bắt buộc thanh toán trước khi nhận xe. */
    @Value("${app.order.require-payment-before-pickup:false}")
    private boolean requirePaymentBeforePickup;

    public HandoverServiceImpl(OrderHandoverRepository handoverRepository,
                               RentalOrderRepository rentalOrderRepository,
                               ActionLogService actionLogService,
                               CurrentUserService currentUserService,
                               Clock clock) {
        this.handoverRepository = handoverRepository;
        this.rentalOrderRepository = rentalOrderRepository;
        this.actionLogService = actionLogService;
        this.currentUserService = currentUserService;
        this.clock = clock;
    }

    @Override
    @Transactional
    public HandoverResponseDTO createHandover(Long orderId, CreateHandoverRequestDTO request) {
        Customer user = currentUserService.getCurrentUser();
        RentalOrder order = findOrder(orderId);
        boolean renter = isRenter(order, user);
        boolean owner = isOwner(order, user);
        if (!renter && !owner) {
            throw new ForbiddenException("Chỉ người thuê hoặc chủ xe mới được lập biên bản bàn giao");
        }
        LocalDateTime now = LocalDateTime.now(clock);
        HandoverType type = request.getHandoverType();

        if (handoverRepository.existsByOrderIdAndHandoverType(orderId, type)) {
            throw new ConflictException("Đơn đã có biên bản " + type);
        }
        if (type == HandoverType.PICKUP) {
            validatePickup(order, now);
        } else {
            validateReturn(order, request);
        }

        OrderHandover handover = OrderHandover.builder()
                .order(order)
                .handoverType(type)
                .odometerKm(request.getOdometerKm())
                .fuelPercent(request.getFuelPercent())
                .conditionNote(request.getConditionNote())
                .handedAt(now)
                .createdAt(now)
                .renterConfirmedAt(renter ? now : null)
                .ownerConfirmedAt(owner ? now : null)
                .build();
        if (request.getImages() != null) {
            for (HandoverImageRequestDTO img : request.getImages()) {
                handover.addImage(HandoverImage.builder()
                        .imageUrl(img.getImageUrl().trim())
                        .caption(img.getCaption())
                        .build());
            }
        }
        handover = handoverRepository.save(handover);
        actionLogService.log(order, user, ActionLogService.HANDOVER_CREATE, order.getStatus(), order.getStatus(),
                "Lập biên bản " + type + (renter ? " (người thuê)" : " (chủ xe)"));
        return HandoverResponseDTO.fromEntity(handover);
    }

    @Override
    @Transactional
    public HandoverResponseDTO confirmHandover(Long handoverId) {
        Customer user = currentUserService.getCurrentUser();
        OrderHandover handover = handoverRepository.findById(handoverId)
                .orElseThrow(() -> new ResourceNotFoundException("Biên bản bàn giao", handoverId));
        RentalOrder order = handover.getOrder();
        LocalDateTime now = LocalDateTime.now(clock);

        if (isRenter(order, user)) {
            if (handover.getRenterConfirmedAt() != null) {
                throw new ConflictException("Bạn đã xác nhận biên bản này rồi");
            }
            handover.setRenterConfirmedAt(now);
        } else if (isOwner(order, user)) {
            if (handover.getOwnerConfirmedAt() != null) {
                throw new ConflictException("Bạn đã xác nhận biên bản này rồi");
            }
            handover.setOwnerConfirmedAt(now);
        } else {
            throw new ForbiddenException("Chỉ người thuê hoặc chủ xe mới được xác nhận biên bản");
        }
        actionLogService.log(order, user, ActionLogService.HANDOVER_CONFIRM, order.getStatus(), order.getStatus(),
                "Xác nhận biên bản " + handover.getHandoverType());

        if (handover.isFullyConfirmed()) {
            applyHandover(order, handover, user);
        }
        handoverRepository.save(handover);
        rentalOrderRepository.saveAndFlush(order);
        return HandoverResponseDTO.fromEntity(handover);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HandoverResponseDTO> getHandoversOfOrder(Long orderId) {
        Customer user = currentUserService.getCurrentUser();
        RentalOrder order = findOrder(orderId);
        if (!isRenter(order, user) && !isOwner(order, user) && !currentUserService.isAdmin(user)) {
            throw new ForbiddenException("Bạn không có quyền xem biên bản của đơn này");
        }
        return handoverRepository.findByOrderIdOrderByHandedAtAsc(orderId).stream()
                .map(HandoverResponseDTO::fromEntity)
                .toList();
    }

    // ------------------------------------------------------------------ helpers

    private void validatePickup(RentalOrder order, LocalDateTime now) {
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new ConflictException("Chỉ bàn giao nhận xe cho đơn đã được chủ xe xác nhận");
        }
        if (now.isBefore(order.getStartTime().minusMinutes(pickupEarlyMinutes))) {
            throw new BadRequestException("Chưa đến giờ nhận xe (sớm nhất "
                    + order.getStartTime().minusMinutes(pickupEarlyMinutes) + ")");
        }
        if (requirePaymentBeforePickup && order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new ConflictException("Đơn chưa được thanh toán, chưa thể nhận xe");
        }
    }

    private void validateReturn(RentalOrder order, CreateHandoverRequestDTO request) {
        if (order.getStatus() != OrderStatus.ONGOING) {
            throw new ConflictException("Chỉ bàn giao trả xe cho đơn đang thuê (ONGOING)");
        }
        handoverRepository.findByOrderIdAndHandoverType(order.getId(), HandoverType.PICKUP)
                .ifPresent(pickup -> {
                    if (pickup.getOdometerKm() != null && request.getOdometerKm() != null
                            && request.getOdometerKm() < pickup.getOdometerKm()) {
                        throw new BadRequestException("Số km lúc trả (" + request.getOdometerKm()
                                + ") nhỏ hơn lúc nhận (" + pickup.getOdometerKm() + ")");
                    }
                });
    }

    /** Biên bản đủ 2 bên xác nhận -> chuyển trạng thái đơn. */
    private void applyHandover(RentalOrder order, OrderHandover handover, Customer actor) {
        OrderStatus from = order.getStatus();
        if (handover.getHandoverType() == HandoverType.PICKUP) {
            changeStatus(order, OrderStatus.ONGOING);
            order.setActualStartTime(handover.getHandedAt());
            actionLogService.log(order, actor, ActionLogService.PICKUP, from, OrderStatus.ONGOING,
                    "Đã bàn giao xe cho người thuê");
        } else {
            changeStatus(order, OrderStatus.COMPLETED);
            order.setActualEndTime(handover.getHandedAt());
            String note = handover.getHandedAt().isAfter(order.getEndTime())
                    ? "Trả xe trễ so với giờ hẹn " + order.getEndTime()
                    : "Đã nhận lại xe";
            actionLogService.log(order, actor, ActionLogService.RETURN, from, OrderStatus.COMPLETED, note);
        }
    }

    private static void changeStatus(RentalOrder order, OrderStatus target) {
        if (!order.getStatus().canTransitionTo(target)) {
            throw new ConflictException("Không thể chuyển đơn từ " + order.getStatus() + " sang " + target);
        }
        order.setStatus(target);
    }

    private RentalOrder findOrder(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Đơn thuê", orderId));
    }

    private static boolean isRenter(RentalOrder order, Customer user) {
        return Objects.equals(order.getCustomer().getId(), user.getId());
    }

    private static boolean isOwner(RentalOrder order, Customer user) {
        return Objects.equals(order.getCar().getOwner().getId(), user.getId());
    }
}
