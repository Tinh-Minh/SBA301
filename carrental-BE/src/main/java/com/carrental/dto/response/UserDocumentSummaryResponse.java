package com.carrental.dto.response;

import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
import java.time.LocalDateTime;

public record UserDocumentSummaryResponse(
        long id,
        long customerId,
        DocumentType docType,
        String docNumberMasked,
        VerificationStatus verifyStatus,
        boolean hasFrontImage,
        boolean hasBackImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {

}
