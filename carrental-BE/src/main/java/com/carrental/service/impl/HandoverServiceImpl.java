package com.carrental.service.impl;

import com.carrental.config.OrderProperties;
import com.carrental.dto.request.CreateHandoverRequestDTO;
import com.carrental.dto.request.HandoverImageRequestDTO;
import com.carrental.dto.response.HandoverResponseDTO;
import com.carrental.entity.Customer;
import com.carrental.entity.HandoverImage;
import com.carrental.entity.OrderHandover;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.HandoverType;
import com.carrental.enums.OrderAction;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.HandoverImageRepository;
import com.carrental.repository.OrderHandoverRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.service.ActionLogService;
import com.carrental.service.CurrentUserService;
import com.carrental.service.HandoverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class HandoverServiceImpl implements HandoverService {

    private final OrderHandoverRepository handoverRepository;
    private final HandoverImageRepository handoverImageRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final ActionLogService actionLogService;
    private final CurrentUserService currentUserService;
    private final OrderProperties orderProperties;
    private final Clock clock;

    @Override
    @Transactional
    public HandoverResponseDTO createHandover(Long orderId, CreateHandoverRequestDTO request) {
        log.info("Lập biên bản bàn giao orderId={}, type={}", orderId, request.getHandoverType());
        return run("lập biên bản bàn giao", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            RentalOrder order = findOrder(orderId);
            boolean renter = order.isRenter(user);
            boolean owner = order.isOwner(user);
            if (!renter && !owner) {
                throw new AppException(HttpStatus.FORBIDDEN, "Chỉ người thuê hoặc chủ xe mới được lập biên bản bàn giao");
            }
            LocalDateTime now = LocalDateTime.now(clock);
            HandoverType type = request.getHandoverType();

            if (handoverRepository.existsByOrderIdAndHandoverType(orderId, type)) {
                throw new AppException(HttpStatus.CONFLICT, "Đơn đã có biên bản " + type);
            }
            if (type == HandoverType.PICKUP) {
                validatePickup(order, now);
            } else {
                validateReturn(order, request);
            }

            // Người lập được tính là đã xác nhận phần của mình; bên còn lại xác nhận sau.
            OrderHandover handover = OrderHandover.builder()
                    .order(order)
                    .handoverType(type)
                    .odometerKm(request.getOdometerKm())
                    .fuelPercent(request.getFuelPercent())
                    .conditionNote(request.getConditionNote())
                    .handedAt(now)
                    .renterConfirmedAt(renter ? now : null)
                    .ownerConfirmedAt(owner ? now : null)
                    .build();
            handover = handoverRepository.save(handover);
            // Entity OrderHandover dùng chung không cascade ảnh nên lưu ảnh riêng qua repository.
            List<HandoverImage> images = new ArrayList<>();
            if (request.getImages() != null) {
                for (HandoverImageRequestDTO img : request.getImages()) {
                    images.add(HandoverImage.builder()
                            .handover(handover)
                            .imageUrl(img.getImageUrl().trim())
                            .caption(img.getCaption())
                            .build());
                }
                images = handoverImageRepository.saveAll(images);
            }
            actionLogService.log(order, user, OrderAction.HANDOVER_CREATE, order.getStatus(), order.getStatus(),
                    "Lập biên bản " + type + (renter ? " (người thuê)" : " (chủ xe)"));
            return HandoverResponseDTO.fromEntity(handover, images);
        });
    }

    @Override
    @Transactional
    public HandoverResponseDTO confirmHandover(Long handoverId) {
        log.info("Xác nhận biên bản bàn giao id={}", handoverId);
        return run("xác nhận biên bản bàn giao", handoverId, () -> {
            Customer user = currentUserService.getCurrentUser();
            OrderHandover handover = handoverRepository.findById(handoverId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                            "Biên bản bàn giao không tồn tại (id=" + handoverId + ")"));
            RentalOrder order = handover.getOrder();
            LocalDateTime now = LocalDateTime.now(clock);

            if (order.isRenter(user)) {
                if (handover.getRenterConfirmedAt() != null) {
                    throw new AppException(HttpStatus.CONFLICT, "Bạn đã xác nhận biên bản này rồi");
                }
                handover.setRenterConfirmedAt(now);
            } else if (order.isOwner(user)) {
                if (handover.getOwnerConfirmedAt() != null) {
                    throw new AppException(HttpStatus.CONFLICT, "Bạn đã xác nhận biên bản này rồi");
                }
                handover.setOwnerConfirmedAt(now);
            } else {
                throw new AppException(HttpStatus.FORBIDDEN, "Chỉ người thuê hoặc chủ xe mới được xác nhận biên bản");
            }
            actionLogService.log(order, user, OrderAction.HANDOVER_CONFIRM, order.getStatus(), order.getStatus(),
                    "Xác nhận biên bản " + handover.getHandoverType());

            if (HandoverResponseDTO.isFullyConfirmed(handover)) {
                applyHandover(order, handover, user);
            }
            handoverRepository.save(handover);
            // RentalOrder có @Version: hai bên xác nhận cùng lúc thì lần ghi sau báo 409 (xem hàm run).
            rentalOrderRepository.saveAndFlush(order);
            return toResponse(handover);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<HandoverResponseDTO> getHandoversOfOrder(Long orderId) {
        return run("xem biên bản bàn giao", orderId, () -> {
            Customer user = currentUserService.getCurrentUser();
            RentalOrder order = findOrder(orderId);
            if (!order.isRenter(user) && !order.isOwner(user) && !currentUserService.isAdmin(user)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem biên bản của đơn này");
            }
            return handoverRepository.findByOrderIdOrderByHandedAtAsc(orderId).stream()
                    .map(this::toResponse)
                    .toList();
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

    private HandoverResponseDTO toResponse(OrderHandover handover) {
        return HandoverResponseDTO.fromEntity(handover,
                handoverImageRepository.findByHandoverIdOrderByIdAsc(handover.getId()));
    }

    private void validatePickup(RentalOrder order, LocalDateTime now) {
        if (order.getStatus() != OrderStatus.CONFIRMED) {
            throw new AppException(HttpStatus.CONFLICT, "Chỉ bàn giao nhận xe cho đơn đã được chủ xe xác nhận");
        }
        LocalDateTime earliest = order.getStartTime().minusMinutes(orderProperties.getPickupEarlyMinutes());
        if (now.isBefore(earliest)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Chưa đến giờ nhận xe (sớm nhất " + earliest + ")");
        }
        if (orderProperties.isRequirePaymentBeforePickup() && order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new AppException(HttpStatus.CONFLICT, "Đơn chưa được thanh toán, chưa thể nhận xe");
        }
    }

    private void validateReturn(RentalOrder order, CreateHandoverRequestDTO request) {
        if (order.getStatus() != OrderStatus.ONGOING) {
            throw new AppException(HttpStatus.CONFLICT, "Chỉ bàn giao trả xe cho đơn đang thuê (ONGOING)");
        }
        handoverRepository.findByOrderIdAndHandoverType(order.getId(), HandoverType.PICKUP)
                .ifPresent(pickup -> {
                    if (pickup.getOdometerKm() != null && request.getOdometerKm() != null
                            && request.getOdometerKm() < pickup.getOdometerKm()) {
                        throw new AppException(HttpStatus.BAD_REQUEST, "Số km lúc trả (" + request.getOdometerKm()
                                + ") nhỏ hơn lúc nhận (" + pickup.getOdometerKm() + ")");
                    }
                });
    }

    /** Biên bản đủ 2 bên xác nhận -> chuyển trạng thái đơn theo luật trong enum OrderStatus. */
    private void applyHandover(RentalOrder order, OrderHandover handover, Customer actor) {
        OrderStatus from = order.getStatus();
        if (handover.getHandoverType() == HandoverType.PICKUP) {
            from.validateTransitionTo(OrderStatus.ONGOING);
            order.setStatus(OrderStatus.ONGOING);
            order.setActualStartTime(handover.getHandedAt());
            log.info("Đơn chuyển sang ONGOING id={}", order.getId());
            actionLogService.log(order, actor, OrderAction.PICKUP, from, OrderStatus.ONGOING,
                    "Đã bàn giao xe cho người thuê");
        } else {
            from.validateTransitionTo(OrderStatus.COMPLETED);
            order.setStatus(OrderStatus.COMPLETED);
            order.setActualEndTime(handover.getHandedAt());
            String note = handover.getHandedAt().isAfter(order.getEndTime())
                    ? "Trả xe trễ so với giờ hẹn " + order.getEndTime()
                    : "Đã nhận lại xe";
            log.info("Đơn chuyển sang COMPLETED id={}", order.getId());
            actionLogService.log(order, actor, OrderAction.RETURN, from, OrderStatus.COMPLETED, note);
        }
    }

    private RentalOrder findOrder(Long orderId) {
        return rentalOrderRepository.findWithDetailsById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Đơn thuê không tồn tại (id=" + orderId + ")"));
    }
}
