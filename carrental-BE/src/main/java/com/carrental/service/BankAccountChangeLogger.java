package com.carrental.service;

import com.carrental.exception.ErrorCode;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Bank-account logs intentionally accept identifiers and allowlisted metadata only. */
@Component
public class BankAccountChangeLogger {
    private static final Logger log = LoggerFactory.getLogger(BankAccountChangeLogger.class);

    public void changed(String action, long actorId, long bankAccountId) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCommit() {
                log.info("Bank account changed action={} traceId={} actorId={} bankAccountId={}",
                        action, traceId, actorId, bankAccountId);
            }
        });
    }

    public void failure(String category, ErrorCode code, long actorId, Long bankAccountId,
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
}
