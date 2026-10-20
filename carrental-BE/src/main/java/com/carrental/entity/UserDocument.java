package com.carrental.entity;

import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_documents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 30)
    private DocumentType docType;

    @Column(name = "doc_number", nullable = false, length = 50)
    private String docNumber;

    @Column(name = "full_name_on_doc", length = 150)
    private String fullNameOnDoc;

    @Column(name = "date_of_birth_on_doc")
    private LocalDate dateOfBirthOnDoc;

    @Column(name = "issue_place", length = 200)
    private String issuePlace;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Column(name = "license_class", length = 10)
    private String licenseClass;

    @Column(name = "front_image_url", nullable = false, length = 500)
    private String frontImageUrl;

    @Column(name = "back_image_url", length = 500)
    private String backImageUrl;

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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
