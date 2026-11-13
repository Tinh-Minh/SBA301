package com.carrental.dto.safety;

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

/** Request/response của hồ sơ an toàn xe (đăng kiểm, bảo hiểm, bảo dưỡng, sửa chữa). */
public final class SafetyDtos {

    private SafetyDtos() {}

    public record SafetyRecordRequest(
            @NotNull(message = "Vui lòng chọn loại bản ghi") SafetyRecordType recordType,
            @NotNull(message = "Vui lòng nhập ngày thực hiện")
            @PastOrPresent(message = "Ngày thực hiện không được ở tương lai") LocalDate performedAt,
            LocalDate expiresAt,
            @Size(max = 200, message = "Tên đơn vị tối đa 200 ký tự") String provider,
            @Size(max = 60, message = "Số chứng từ tối đa 60 ký tự") String referenceNumber,
            @Min(value = 0, message = "Số km không được âm")
            @Max(value = 2_000_000, message = "Số km không hợp lệ") Integer odometerKm,
            SafetyRecordResult result,
            @Size(max = 1000, message = "Ghi chú tối đa 1000 ký tự") String note,
            @Size(max = 500, message = "Đường dẫn tệp tối đa 500 ký tự")
            @Pattern(regexp = "^$|^/(?!/)\\S+$",
                    message = "Vui lòng tải tệp lên từ máy tính, không dùng URL ngoài")
            String fileUrl) {}

    public record SafetyVerifyRequest(
            @NotNull(message = "Vui lòng chọn kết quả xác minh") VerificationStatus verifyStatus,
            @Size(max = 500, message = "Lý do tối đa 500 ký tự") String rejectReason) {}

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

    /** Tình trạng hiệu lực của một hạng mục (đăng kiểm / bảo hiểm). */
    public enum Validity { VALID, EXPIRING_SOON, EXPIRED, MISSING }

    /** Mức an toàn tổng hợp hiển thị cho khách thuê. */
    public enum SafetyLevel { SAFE, ATTENTION, UNSAFE, UNKNOWN }

    public record SafetyItem(
            Validity validity,
            LocalDate validUntil,
            Long daysRemaining,
            boolean verified,
            String provider) {}

    public record SafetySummaryResponse(
            Long carId,
            SafetyLevel level,
            String headline,
            List<String> highlights,
            List<String> warnings,
            SafetyItem inspection,
            SafetyItem insurance,
            LocalDate lastMaintenanceAt,
            Integer lastMaintenanceOdometerKm,
            LocalDate nextMaintenanceDueAt,
            Integer latestOdometerKm,
            int repairCount,
            int verifiedRecordCount,
            int totalRecordCount,
            List<SafetyRecordResponse> records) {}
}
