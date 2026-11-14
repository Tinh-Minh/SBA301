package com.carrental.dto.response.safety;

import com.carrental.entity.CarSafetyRecord;
import com.carrental.enums.SafetyRecordResult;
import com.carrental.enums.SafetyRecordType;
import com.carrental.enums.VerificationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.carrental.dto.request.safety.*;
import com.carrental.enums.*;

public record SafetyRecordResponse(
        Long id,
        Long carId,
        String carName,
        String carLicensePlate,
        String ownerName,
        SafetyRecordType recordType,
        LocalDate performedAt,
        LocalDate expiresAt,
        String provider,
        String referenceNumber,
        Integer odometerKm,
        SafetyRecordResult result,
        String note,
        String fileUrl,
        VerificationStatus verifyStatus,
        String rejectReason,
        LocalDateTime verifiedAt,
        LocalDateTime createdAt) {

    /** Bản đầy đủ cho chủ xe / admin. */
    public static SafetyRecordResponse full(CarSafetyRecord r) {
        return build(r, true);
    }

    /** Bản công khai: ẩn số chứng từ, tệp đính kèm và lý do từ chối. */
    public static SafetyRecordResponse publicView(CarSafetyRecord r) {
        return build(r, false);
    }

    private static SafetyRecordResponse build(CarSafetyRecord r, boolean full) {
        var car = r.getCar();
        return new SafetyRecordResponse(
                r.getId(),
                car.getId(),
                (car.getBrand() + " " + car.getModel()).trim(),
                full ? car.getLicensePlate() : null,
                full && car.getOwner() != null ? car.getOwner().getFullName() : null,
                r.getRecordType(),
                r.getPerformedAt(),
                r.getExpiresAt(),
                r.getProvider(),
                full ? r.getReferenceNumber() : null,
                r.getOdometerKm(),
                r.getResult(),
                r.getNote(),
                full ? r.getFileUrl() : null,
                r.getVerifyStatus(),
                full ? r.getRejectReason() : null,
                r.getVerifiedAt(),
                r.getCreatedAt());
    }
}
