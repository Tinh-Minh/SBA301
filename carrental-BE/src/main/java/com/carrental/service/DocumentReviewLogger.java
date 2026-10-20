package com.carrental.service;

import com.carrental.enums.VerificationStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.DocumentType;
import com.carrental.web.RequestTraceFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Emits only non-sensitive review metadata after the transaction commits. */
@Component
public class DocumentReviewLogger {
    private static final Logger log = LoggerFactory.getLogger(DocumentReviewLogger.class);

    public void record(long actorId, long ownerId, long documentId, DocumentType type,
            VerificationStatus oldStatus, VerificationStatus newStatus,
            KycStatus oldKyc, KycStatus newKyc, boolean reasonProvided) {
        String traceId = RequestTraceFilter.currentTraceId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                log.info("Document review committed action=document-review traceId={} actorId={} ownerId={} documentId={} docType={} oldStatus={} newStatus={} oldKyc={} newKyc={} reasonProvided={}",
                        traceId, actorId, ownerId, documentId, type, oldStatus, newStatus, oldKyc, newKyc, reasonProvided);
            }
        });
    }
}
