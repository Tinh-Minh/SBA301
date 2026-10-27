package com.carrental.service;

import com.carrental.dto.request.CreateHandoverRequest;
import com.carrental.dto.response.HandoverResponse;

import java.util.List;

/**
 * Bàn giao xe. Biên bản do người thuê hoặc chủ xe lập (người lập tự xác nhận phần mình),
 * bên còn lại xác nhận. Khi đủ 2 bên:
 * PICKUP: CONFIRMED -> ONGOING (ghi actual_start_time);
 * RETURN: ONGOING -> COMPLETED (ghi actual_end_time).
 * Lỗi nghiệp vụ là {@link com.carrental.exception.AppException} (400/403/404/409).
 */
public interface HandoverService {

    /**
     * Lập biên bản PICKUP (đơn CONFIRMED, không sớm hơn giờ nhận − app.order.pickup-early-minutes,
     * đã thanh toán nếu bật app.order.require-payment-before-pickup) hoặc RETURN (đơn ONGOING,
     * số km không nhỏ hơn lúc nhận). Mỗi đơn chỉ một biên bản cho mỗi loại.
     */
    HandoverResponse createHandover(Long orderId, CreateHandoverRequest request);

    /** Bên còn lại xác nhận biên bản; đủ hai bên thì chuyển trạng thái đơn và ghi log PICKUP/RETURN. */
    HandoverResponse confirmHandover(Long handoverId);

    /** Biên bản của đơn kèm ảnh; người thuê, chủ xe hoặc admin mới xem được. */
    List<HandoverResponse> getHandoversOfOrder(Long orderId);
}
