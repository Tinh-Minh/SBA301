package com.carrental.dto.request.document;

import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.enums.DocumentType;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;

/** Explicit allowlisted metadata accepted for one new pending document submission. */
public record UserDocumentSubmissionRequest(
        DocumentType docType,
        String docNumber,
        String fullNameOnDoc,
        LocalDate dateOfBirthOnDoc,
        String issuePlace,
        LocalDate issueDate,
        LocalDate expiresAt,
        String licenseClass) {

    public static UserDocumentSubmissionRequest parse(java.util.Map<String, String> values, Clock clock) {
        List<FieldErrorResponse> errors = new ArrayList<>();
        DocumentType docType = enumValue(values.get("docType"), "docType", errors);
        String docNumber = requiredText(values.get("docNumber"), "docNumber", 50, errors);
        String fullName = optionalText(values.get("fullNameOnDoc"), "fullNameOnDoc", 150, errors);
        String issuePlace = optionalText(values.get("issuePlace"), "issuePlace", 200, errors);
        LocalDate birth = optionalDate(values.get("dateOfBirthOnDoc"), "dateOfBirthOnDoc", errors);
        LocalDate issue = optionalDate(values.get("issueDate"), "issueDate", errors);
        LocalDate expiry = optionalDate(values.get("expiresAt"), "expiresAt", errors);
        String license = optionalText(values.get("licenseClass"), "licenseClass", 10, errors);
        if (birth != null && birth.isAfter(LocalDate.now(clock))) {
            errors.add(new FieldErrorResponse("dateOfBirthOnDoc", "Ngày sinh trên giấy tờ không hợp lệ"));
        }
        if (issue != null && expiry != null && issue.isAfter(expiry)) {
            errors.add(new FieldErrorResponse("expiresAt", "Ngày hết hạn phải bằng hoặc sau ngày cấp"));
        }
        if (docType == DocumentType.DRIVER_LICENSE && license == null) {
            errors.add(new FieldErrorResponse("licenseClass", "Hạng bằng lái là bắt buộc"));
        }
        if (!errors.isEmpty()) throw new AppException(ErrorCode.VALIDATION_ERROR, errors);
        return new UserDocumentSubmissionRequest(docType, docNumber, fullName, birth, issuePlace, issue, expiry, license);
    }

    private static String requiredText(String input, String field, int maximum, List<FieldErrorResponse> errors) {
        String value = input == null ? null : input.strip();
        if (value == null || value.isEmpty()) {
            errors.add(new FieldErrorResponse(field, "Trường này là bắt buộc"));
            return null;
        }
        if (value.length() > maximum) errors.add(new FieldErrorResponse(field, "Giá trị vượt quá giới hạn cho phép"));
        return value;
    }

    private static String optionalText(String input, String field, int maximum, List<FieldErrorResponse> errors) {
        if (input == null || input.strip().isEmpty()) return null;
        String value = input.strip();
        if (value.length() > maximum) errors.add(new FieldErrorResponse(field, "Giá trị vượt quá giới hạn cho phép"));
        return value;
    }

    private static LocalDate optionalDate(String input, String field, List<FieldErrorResponse> errors) {
        if (input == null || input.strip().isEmpty()) return null;
        try {
            return LocalDate.parse(input.strip());
        } catch (DateTimeParseException exception) {
            errors.add(new FieldErrorResponse(field, "Ngày phải theo định dạng yyyy-MM-dd"));
            return null;
        }
    }

    private static DocumentType enumValue(String input, String field, List<FieldErrorResponse> errors) {
        if (input == null || input.strip().isEmpty()) {
            errors.add(new FieldErrorResponse(field, "Trường này là bắt buộc"));
            return null;
        }
        try {
            return DocumentType.valueOf(input.strip());
        } catch (IllegalArgumentException exception) {
            errors.add(new FieldErrorResponse(field, "Loại giấy tờ không hợp lệ"));
            return null;
        }
    }
}
