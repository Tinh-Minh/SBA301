package com.carrental.service;

import com.carrental.enums.CustomerStatus;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Emits status-change metadata only after the surrounding database transaction commits. */
@Component
public class CustomerStatusChangeLogger {
    private static final Logger log = LoggerFactory.getLogger(CustomerStatusChangeLogger.class);

    public void record(long actorId, long targetId, CustomerStatus oldStatus,
            CustomerStatus newStatus, boolean reasonProvided) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("Customer status changed action=customer-status traceId={} actorId={} targetId={} oldStatus={} newStatus={} reasonProvided={}",
                        traceId, actorId, targetId, oldStatus, newStatus, reasonProvided);
            }
        });
    }
}
