package com.carrental.service;

import com.carrental.dto.response.ActionLogDTO;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DocumentType;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.OrderStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.ErrorCode;

import java.util.List;

/** Ghi và đọc lịch sử thao tác của đơn thuê (bảng action_logs). */
public interface ActionLogService {

    /** Tên các hành động ghi vào cột action. */
    String CREATE = "CREATE";
    String CONFIRM = "CONFIRM";
    String REJECT = "REJECT";
    String CANCEL = "CANCEL";
    String EXPIRE = "EXPIRE";
    String HANDOVER_CREATE = "HANDOVER_CREATE";
    String HANDOVER_CONFIRM = "HANDOVER_CONFIRM";
    String PICKUP = "PICKUP";
    String RETURN = "RETURN";

    /**
     * @param actor null nếu là hệ thống
     */
    void log(RentalOrder order, Customer actor, String action,
             OrderStatus fromStatus, OrderStatus toStatus, String note);

    List<ActionLogDTO> getLogsOfOrder(Long orderId);

    void bankAccountChanged(String action, long actorId, long bankAccountId);
    void bankAccountFailure(String category, ErrorCode code, long actorId, Long bankAccountId,
            String exceptionType, String allowlistedConstraint);
    void customerStatusChanged(long actorId, long targetId, CustomerStatus oldStatus,
            CustomerStatus newStatus, boolean reasonProvided);
    void documentReviewRecorded(long actorId, long ownerId, long documentId, DocumentType type,
            VerificationStatus oldStatus, VerificationStatus newStatus,
            KycStatus oldKyc, KycStatus newKyc, boolean reasonProvided);
    void driverCreated(long actorId, long ownerId, long driverId);
    void driverChanged(long actorId, long ownerId, long driverId, DriverStatus oldStatus,
            DriverStatus newStatus, boolean reasonProvided);
    void driverFailure(String category, ErrorCode code, long actorId, Long ownerId, Long driverId,
            String exceptionType, String allowlistedConstraint);
    void voucherChanged(String action, long actorId, long voucherId);
    void voucherStatusChanged(String action, long actorId, long voucherId,
            VoucherStatus oldStatus, VoucherStatus newStatus);
    void voucherFailure(String category, ErrorCode code, long actorId, Long voucherId,
            String exceptionType, String allowlistedConstraint);
}
