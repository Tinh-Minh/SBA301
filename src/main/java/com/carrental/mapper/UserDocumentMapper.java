package com.carrental.mapper;

import com.carrental.dto.response.UserDocumentDetailResponse;
import com.carrental.dto.response.UserDocumentSummaryResponse;
import com.carrental.entity.UserDocument;

public final class UserDocumentMapper {
    private UserDocumentMapper() { }

    public static UserDocumentDetailResponse toDetail(UserDocument document) {
        return new UserDocumentDetailResponse(document.getId(), document.getCustomer().getId(), document.getDocType(),
                document.getDocNumber(), document.getFullNameOnDoc(), document.getDateOfBirthOnDoc(), document.getIssuePlace(),
                document.getIssueDate(), document.getExpiresAt(), document.getLicenseClass(), document.getVerifyStatus(),
                document.getRejectReason(), document.getVerifiedBy() == null ? null : document.getVerifiedBy().getId(),
                document.getVerifiedAt(), true, document.getBackImageUrl() != null,
                document.getCreatedAt(), document.getUpdatedAt());
    }

    public static UserDocumentSummaryResponse toSummary(UserDocument document) {
        return new UserDocumentSummaryResponse(document.getId(), document.getCustomer().getId(), document.getDocType(),
                mask(document.getDocNumber()), document.getVerifyStatus(), true, document.getBackImageUrl() != null,
                document.getCreatedAt(), document.getUpdatedAt());
    }

    public static String mask(String value) {
        if (value == null || value.length() <= 4) return value == null ? "" : "*".repeat(value.length());
        int visible = Math.min(4, value.length());
        return "*".repeat(value.length() - visible) + value.substring(value.length() - visible);
    }
}
