package com.carrental.entity;

import com.carrental.enums.SafetyRecordResult;
import com.carrental.enums.SafetyRecordType;
import com.carrental.enums.VerificationStatus;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;

/**
 * Một dòng trong hồ sơ an toàn của xe: lần đăng kiểm, hợp đồng bảo hiểm, lần bảo dưỡng
 * hoặc sửa chữa. Chủ xe khai báo, admin xác minh; khách thuê xem bản tóm tắt công khai.
 */
@Entity
@Table(name = "car_safety_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarSafetyRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false)
    private Car car;

    @Enumerated(EnumType.STRING)
    @Column(name = "record_type", nullable = false, length = 20)
    private SafetyRecordType recordType;

    /** Ngày thực hiện (ngày đăng kiểm, ngày mua bảo hiểm, ngày bảo dưỡng...). */
    @Column(name = "performed_at", nullable = false)
    private LocalDate performedAt;

    /** Ngày hết hiệu lực (đăng kiểm, bảo hiểm) hoặc ngày bảo dưỡng kế tiếp. */
    @Column(name = "expires_at")
    private LocalDate expiresAt;

    /** Trung tâm đăng kiểm / hãng bảo hiểm / gara. */
    @Column(name = "provider", length = 200)
    private String provider;

    /** Số tem đăng kiểm, số hợp đồng bảo hiểm, số phiếu dịch vụ. */
    @Column(name = "reference_number", length = 60)
    private String referenceNumber;

    @Column(name = "odometer_km")
    private Integer odometerKm;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, length = 20)
    @Builder.Default
    private SafetyRecordResult result = SafetyRecordResult.NOT_APPLICABLE;

    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "verify_status", nullable = false, length = 20)
    @Builder.Default
    private VerificationStatus verifyStatus = VerificationStatus.PENDING;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Customer verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}
