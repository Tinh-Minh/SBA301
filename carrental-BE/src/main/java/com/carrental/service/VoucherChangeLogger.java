package com.carrental.service;

import com.carrental.enums.VoucherStatus;
import com.carrental.exception.ErrorCode;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Voucher diagnostics contain identifiers and allowlisted metadata only. */
@Component
public class VoucherChangeLogger {
    private static final Logger log = LoggerFactory.getLogger(VoucherChangeLogger.class);

    public void changed(String action, long actorId, long voucherId) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                log.info("Voucher changed action={} traceId={} actorId={} voucherId={}",
                        action, traceId, actorId, voucherId);
            }
        });
    }

    public void changed(String action, long actorId, long voucherId, VoucherStatus oldStatus, VoucherStatus newStatus) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                if (oldStatus == null) {
                    log.info("Voucher changed action={} traceId={} actorId={} voucherId={} status={}",
                            action, traceId, actorId, voucherId, newStatus);
                } else {
                    log.info("Voucher changed action={} traceId={} actorId={} voucherId={} oldStatus={} newStatus={}",
                            action, traceId, actorId, voucherId, oldStatus, newStatus);
                }
            }
        });
    }

    public void failure(String category, ErrorCode code, long actorId, Long voucherId,
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
}
