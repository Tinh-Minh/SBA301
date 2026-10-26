package com.carrental.service.impl;

import com.carrental.dto.response.ActionLogDTO;
import com.carrental.entity.ActionLog;
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
import com.carrental.repository.ActionLogRepository;
import com.carrental.service.ActionLogService;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.util.List;

@Service
public class ActionLogServiceImpl implements ActionLogService {

    private static final Logger log = LoggerFactory.getLogger(ActionLogServiceImpl.class);
    private final ActionLogRepository actionLogRepository;

    public ActionLogServiceImpl(ActionLogRepository actionLogRepository) {
        this.actionLogRepository = actionLogRepository;
    }

    @Override
    @Transactional
    public void log(RentalOrder order, Customer actor, String action,
                    OrderStatus fromStatus, OrderStatus toStatus, String note) {
        // Entity ActionLog dùng chung lưu trạng thái dạng chuỗi; created_at do @CreationTimestamp tự điền.
        actionLogRepository.save(ActionLog.builder()
                .order(order)
                .actor(actor)
                .action(action)
                .fromStatus(fromStatus == null ? null : fromStatus.name())
                .toStatus(toStatus == null ? null : toStatus.name())
                .note(truncate(note))
                .build());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActionLogDTO> getLogsOfOrder(Long orderId) {
        return actionLogRepository.findByOrderIdOrderByCreatedAtAscIdAsc(orderId).stream()
                .map(ActionLogDTO::fromEntity)
                .toList();
    }

    @Override
    public void bankAccountChanged(String action, long actorId, long bankAccountId) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> log.info("Bank account changed action={} traceId={} actorId={} bankAccountId={}",
                action, traceId, actorId, bankAccountId));
    }

    @Override
    public void bankAccountFailure(String category, ErrorCode code, long actorId, Long bankAccountId,
            String exceptionType, String allowlistedConstraint) {
        if (allowlistedConstraint == null) {
            log.error("Bank account operation failed action=bank-account-failure traceId={} category={} errorCode={} actorId={} bankAccountId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, code.name(), actorId, bankAccountId, exceptionType);
        } else {
            log.warn("Bank account operation failed action=bank-account-failure traceId={} category={} errorCode={} actorId={} bankAccountId={} constraint={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, code.name(), actorId, bankAccountId,
                    allowlistedConstraint, exceptionType);
        }
    }

    @Override
    public void customerStatusChanged(long actorId, long targetId, CustomerStatus oldStatus,
            CustomerStatus newStatus, boolean reasonProvided) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> log.info("Customer status changed action=customer-status traceId={} actorId={} targetId={} oldStatus={} newStatus={} reasonProvided={}",
                traceId, actorId, targetId, oldStatus, newStatus, reasonProvided));
    }

    @Override
    public void documentReviewRecorded(long actorId, long ownerId, long documentId, DocumentType type,
            VerificationStatus oldStatus, VerificationStatus newStatus,
            KycStatus oldKyc, KycStatus newKyc, boolean reasonProvided) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> log.info("Document review committed action=document-review traceId={} actorId={} ownerId={} documentId={} docType={} oldStatus={} newStatus={} oldKyc={} newKyc={} reasonProvided={}",
                traceId, actorId, ownerId, documentId, type, oldStatus, newStatus, oldKyc, newKyc, reasonProvided));
    }

    @Override
    public void driverCreated(long actorId, long ownerId, long driverId) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> log.info("Driver profile created action=driver-create traceId={} actorId={} ownerId={} driverId={} status=PENDING",
                traceId, actorId, ownerId, driverId));
    }

    @Override
    public void driverChanged(long actorId, long ownerId, long driverId, DriverStatus oldStatus,
            DriverStatus newStatus, boolean reasonProvided) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> log.info("Driver status changed action=driver-status traceId={} actorId={} ownerId={} driverId={} oldStatus={} newStatus={} reasonProvided={}",
                traceId, actorId, ownerId, driverId, oldStatus, newStatus, reasonProvided));
    }

    @Override
    public void driverFailure(String category, ErrorCode code, long actorId, Long ownerId, Long driverId,
            String exceptionType, String allowlistedConstraint) {
        if (allowlistedConstraint == null) {
            log.error("Driver operation failed action=driver-operation-failure traceId={} category={} errorCode={} actorId={} ownerId={} driverId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, code.name(), actorId, ownerId, driverId, exceptionType);
        } else {
            log.warn("Driver operation failed action=driver-operation-failure traceId={} category={} errorCode={} actorId={} ownerId={} driverId={} constraint={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, code.name(), actorId, ownerId, driverId,
                    allowlistedConstraint, exceptionType);
        }
    }

    @Override
    public void voucherChanged(String action, long actorId, long voucherId) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> log.info("Voucher changed action={} traceId={} actorId={} voucherId={}",
                action, traceId, actorId, voucherId));
    }

    @Override
    public void voucherStatusChanged(String action, long actorId, long voucherId,
            VoucherStatus oldStatus, VoucherStatus newStatus) {
        String traceId = RequestTraceFilter.currentTraceId();
        afterCommit(() -> {
            if (oldStatus == null) {
                log.info("Voucher changed action={} traceId={} actorId={} voucherId={} status={}",
                        action, traceId, actorId, voucherId, newStatus);
            } else {
                log.info("Voucher changed action={} traceId={} actorId={} voucherId={} oldStatus={} newStatus={}",
                        action, traceId, actorId, voucherId, oldStatus, newStatus);
            }
        });
    }

    @Override
    public void voucherFailure(String category, ErrorCode code, long actorId, Long voucherId,
            String exceptionType, String allowlistedConstraint) {
        if (allowlistedConstraint == null) {
            log.error("Voucher operation failed action=voucher-operation-failure traceId={} category={} errorCode={} actorId={} voucherId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, code.name(), actorId, voucherId, exceptionType);
        } else {
            log.warn("Voucher operation failed action=voucher-operation-failure traceId={} category={} errorCode={} actorId={} voucherId={} constraint={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), category, code.name(), actorId, voucherId,
                    allowlistedConstraint, exceptionType);
        }
    }

    private static void afterCommit(Runnable action) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                action.run();
            }
        });
    }

    private static String truncate(String note) {
        if (note == null) return null;
        return note.length() <= 500 ? note : note.substring(0, 500);
    }
}
