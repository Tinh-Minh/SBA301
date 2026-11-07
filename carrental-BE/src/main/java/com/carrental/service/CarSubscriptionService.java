package com.carrental.service;

import com.carrental.dto.request.CreateSubscriptionRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.SubscriptionPackageOption;
import com.carrental.dto.response.SubscriptionQuoteResponse;
import com.carrental.dto.response.SubscriptionResponse;
import com.carrental.enums.SubscriptionStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Mua gói đăng tin và vòng đời tin đăng (Function 3).
 * Mọi lỗi nghiệp vụ là {@link com.carrental.exception.AppException}: 400 dữ liệu sai hoặc chuyển trạng thái
 * không hợp lệ, 403 không có quyền, 404 không tìm thấy, 409 xe đang có gói còn hiệu lực hoặc chờ thanh toán.
 */
public interface CarSubscriptionService {

    /** Các gói cước đang mở bán. */
    List<SubscriptionPackageOption> getPackages();

    /** Tính tiền gói cho xe của người đang đăng nhập (áp voucher nếu có), không ghi DB. */
    SubscriptionQuoteResponse quote(CreateSubscriptionRequest request);

    /**
     * Tạo yêu cầu mua gói PENDING_PAYMENT cho xe đã duyệt của người đang đăng nhập; mua cho xe đã hết hạn tin
     * chính là gia hạn. Giá tính lại phía server, tăng lượt voucher. Tổng tiền bằng 0 thì kích hoạt ngay.
     */
    SubscriptionResponse createSubscription(CreateSubscriptionRequest request);

    /**
     * Function 4 gọi khi thanh toán thành công: PENDING_PAYMENT -> ACTIVE, PAID, tính start_date và end_date,
     * xe chuyển LISTED. Gọi lại với gói đã ACTIVE thì không làm gì.
     */
    void activateSubscription(Long subscriptionId);

    /** Lịch sử mua gói của người đang đăng nhập. */
    PageResponse<SubscriptionResponse> getMySubscriptions(Pageable pageable);

    /** Chủ xe mua gói hoặc admin mới xem được. */
    SubscriptionResponse getSubscriptionDetail(Long id);

    /**
     * Huỷ gói: chủ xe huỷ được gói chưa thanh toán (trả lượt voucher); admin huỷ được cả gói đang ACTIVE
     * (xe chuyển UNLISTED). Không hoàn tiền: việc hoàn tiền thuộc Function 4.
     */
    SubscriptionResponse cancelSubscription(Long id);

    /** Toàn bộ gói trên sàn, lọc trạng thái nếu có; chỉ admin (kiểm tra bằng @PreAuthorize ở controller). */
    PageResponse<SubscriptionResponse> getAllSubscriptions(SubscriptionStatus status, Pageable pageable);

    /** Id các gói ACTIVE đã qua end_date (dùng cho job hết hạn). */
    List<Long> findExpiredSubscriptionIds();

    /** Hệ thống chuyển một gói ACTIVE quá hạn sang EXPIRED và tạm ẩn tin. Trả về false nếu gói không còn quá hạn. */
    boolean expireSubscription(Long id);

    /** Id các gói PENDING_PAYMENT đã quá hạn thanh toán (dùng cho job hết hạn). */
    List<Long> findOverduePendingIds();

    /** Hệ thống huỷ một gói quá hạn thanh toán, trả lượt voucher. Trả về false nếu gói không còn chờ thanh toán. */
    boolean cancelOverduePending(Long id);
}
