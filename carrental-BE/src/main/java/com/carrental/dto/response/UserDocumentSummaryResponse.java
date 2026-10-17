package com.carrental.dto.response;

import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.UserDocumentType;
import java.time.LocalDateTime;

public record UserDocumentSummaryResponse(
        long id,
        long customerId,
        UserDocumentType docType,
        String docNumberMasked,
        DocumentVerifyStatus verifyStatus,
        boolean hasFrontImage,
        boolean hasBackImage,
        LocalDateTime createdAt,
        LocalDateTime updatedAt) {
}
