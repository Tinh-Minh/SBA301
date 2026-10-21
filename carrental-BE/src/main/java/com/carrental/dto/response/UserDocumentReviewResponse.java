package com.carrental.dto.response;

import com.carrental.enums.KycStatus;
import java.time.LocalDate;

/** Allowlisted result of one review command and its committed KYC snapshot decision. */
public record UserDocumentReviewResponse(
        UserDocumentDetailResponse document,
        KycStatus kycStatus,
        LocalDate evaluatedOn) {
}
