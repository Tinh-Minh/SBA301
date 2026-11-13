package com.carrental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Phiếu tiền gửi Admin xử lý (chuyển khoản thủ công trong 1–3 ngày làm việc):
 * hoàn tiền cho khách, chi trả tiền thuê cho chủ xe, hoặc phạt chủ xe (cấn trừ vào lần chi trả sau).
 * Thông tin ngân hàng được chụp lại tại thời điểm tạo phiếu.
 */
@Entity
@Table(name = "settlement_slips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettlementSlip {

    public enum SlipType { CUSTOMER_REFUND, OWNER_PAYOUT, OWNER_PENALTY }

    public enum SlipStatus { PENDING, COMPLETED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slip_code", nullable = false, unique = true, length = 30)
    private String slipCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "slip_type", nullable = false, length = 20)
    private SlipType slipType;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "booking_code", length = 30)
    private String bookingCode;

    /** Người nhận tiền (khách hoặc chủ xe); với phiếu phạt là chủ xe bị phạt. */
    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Column(name = "recipient_name", length = 150)
    private String recipientName;

    @Column(name = "amount", nullable = false, precision = 14, scale = 0)
    private BigDecimal amount;

    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private SlipStatus status = SlipStatus.PENDING;

    @Column(name = "bank_account_number", length = 30)
    private String bankAccountNumber;

    @Column(name = "bank_name", length = 100)
    private String bankName;

    @Column(name = "bank_branch", length = 150)
    private String bankBranch;

    @Column(name = "bank_account_holder", length = 150)
    private String bankAccountHolder;

    /** Hạn xử lý: 3 ngày làm việc kể từ khi tạo phiếu. */
    @Column(name = "due_at", nullable = false)
    private LocalDateTime dueAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by")
    private Long processedBy;

    /** Mã giao dịch chuyển khoản ngân hàng do admin nhập khi hoàn tất. */
    @Column(name = "reference_code", length = 100)
    private String referenceCode;

    @Column(name = "note", length = 500)
    private String note;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
