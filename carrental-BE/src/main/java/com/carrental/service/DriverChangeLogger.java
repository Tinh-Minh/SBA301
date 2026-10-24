package com.carrental.service;

import com.carrental.enums.DriverStatus;
import com.carrental.exception.ErrorCode;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Safe positive diagnostics and commit-only driver lifecycle events. */
@Component
public class DriverChangeLogger {
    private static final Logger log = LoggerFactory.getLogger(DriverChangeLogger.class);

    public void created(long actorId, long ownerId, long driverId) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                log.info("Driver profile created action=driver-create traceId={} actorId={} ownerId={} driverId={} status=PENDING",
                        traceId, actorId, ownerId, driverId);
            }
        });
    }

    public void changed(long actorId, long ownerId, long driverId, DriverStatus oldStatus,
            DriverStatus newStatus, boolean reasonProvided) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                log.info("Driver status changed action=driver-status traceId={} actorId={} ownerId={} driverId={} oldStatus={} newStatus={} reasonProvided={}",
                        traceId, actorId, ownerId, driverId, oldStatus, newStatus, reasonProvided);
            }
        });
    }

    public void failure(String category, ErrorCode code, long actorId, Long ownerId, Long driverId,
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
}
