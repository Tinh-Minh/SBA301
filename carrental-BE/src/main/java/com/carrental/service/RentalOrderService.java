package com.carrental.service;

import com.carrental.dto.request.CreateOrderRequest;
import com.carrental.dto.request.QuoteRequest;
import com.carrental.dto.response.ActionLogResponse;
import com.carrental.dto.response.OrderResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.PriceQuoteResponse;
import com.carrental.enums.OrderStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Đặt xe và vòng đời đơn thuê (Function 3).
 * Mọi lỗi nghiệp vụ là {@link com.carrental.exception.AppException}: 400 dữ liệu sai hoặc chuyển trạng thái
 * không hợp lệ, 403 không có quyền với đơn, 404 không tìm thấy, 409 xung đột (trùng lịch, quá hạn, sửa đồng thời).
 */
public interface RentalOrderService {

    /** Tính tiền thuê (giờ/ngày làm tròn lên, áp voucher) cho người đang đăng nhập, không ghi DB. */
    PriceQuoteResponse quote(QuoteRequest request);

    /**
     * Tạo đơn PENDING: tính lại giá phía server, chống trùng lịch, tăng lượt voucher,
     * đặt hạn xác nhận = min(bây giờ + app.order.confirm-timeout-minutes, giờ nhận xe), ghi log CREATE.
     */
    OrderResponse createOrder(CreateOrderRequest request);

    /** Người thuê, chủ xe của đơn hoặc admin mới xem được. */
    OrderResponse getOrder(Long orderId);

    /** Đơn của người đang đăng nhập (vai trò người thuê), lọc trạng thái nếu có. */
    PageResponse<OrderResponse> getMyRentals(OrderStatus status, Pageable pageable);

    /** Đơn trên các xe của người đang đăng nhập (vai trò chủ xe), lọc trạng thái nếu có. */
    PageResponse<OrderResponse> getOrdersOfMyCars(OrderStatus status, Pageable pageable);

    /** Toàn bộ đơn; chỉ admin (kiểm tra bằng @PreAuthorize ở controller). */
    PageResponse<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable);

    /**
     * Chủ xe xác nhận đơn PENDING còn trong hạn: PENDING -> CONFIRMED, đặt lại expiresAt thành hạn thanh toán
     * = min(bây giờ + app.order.payment-timeout-minutes, giờ nhận xe), ghi log CONFIRM.
     */
    OrderResponse confirmOrder(Long orderId, String note);

    /** Chủ xe từ chối đơn PENDING (bắt buộc lý do): PENDING -> REJECTED, trả lượt voucher, ghi log REJECT. */
    OrderResponse rejectOrder(Long orderId, String reason);

    /**
     * Huỷ đơn PENDING hoặc CONFIRMED (chưa nhận xe): người thuê không cần lý do, chủ xe và admin bắt buộc lý do.
     * Trả lượt voucher, giải phóng lịch xe, ghi log CANCEL.
     */
    OrderResponse cancelOrder(Long orderId, String reason);

    /** Id các đơn PENDING đã quá hạn chủ xe xác nhận (dùng cho job hết hạn). */
    List<Long> findOverduePendingOrderIds();

    /**
     * Hệ thống chuyển một đơn PENDING quá hạn sang EXPIRED (mỗi đơn một transaction riêng
     * để một đơn lỗi/bị sửa đồng thời không làm hỏng cả lô). Trả về false nếu đơn không còn quá hạn.
     */
    boolean expireOrder(Long orderId);

    /**
     * Id các đơn CONFIRMED chưa thanh toán đã quá hạn thanh toán (dùng cho job hết hạn).
     * Rỗng khi app.order.require-payment-before-pickup tắt, vì khi đó đơn không bắt buộc trả trước.
     */
    List<Long> findOverduePaymentOrderIds();

    /**
     * Hệ thống huỷ một đơn CONFIRMED quá hạn thanh toán: CONFIRMED -> CANCELLED, trả lượt voucher,
     * giải phóng lịch xe, ghi log CANCEL (actor NULL). Trả về false nếu đơn đã thanh toán hoặc chưa quá hạn.
     */
    boolean cancelOverduePaymentOrder(Long orderId);

    /** Lịch sử thao tác của đơn theo thứ tự thời gian; quyền xem như {@link #getOrder(Long)}. */
    List<ActionLogResponse> getOrderLogs(Long orderId);
}
