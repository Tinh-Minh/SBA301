package com.carrental.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "user_documents")
public class UserDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Size(max = 30)
    @NotNull
    @Column(name = "doc_type", nullable = false, length = 30)
    private String docType;

    @Size(max = 50)
    @NotNull
    @Column(name = "doc_number", nullable = false, length = 50)
    private String docNumber;

    @Size(max = 150)
    @Column(name = "full_name_on_doc", length = 150)
    private String fullNameOnDoc;

    @Column(name = "date_of_birth_on_doc")
    private LocalDate dateOfBirthOnDoc;

    @Size(max = 200)
    @Column(name = "issue_place", length = 200)
    private String issuePlace;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expires_at")
    private LocalDate expiresAt;

    @Size(max = 10)
    @Column(name = "license_class", length = 10)
    private String licenseClass;

    @Size(max = 500)
    @NotNull
    @Column(name = "front_image_url", nullable = false, length = 500)
    private String frontImageUrl;

    @Size(max = 500)
    @Column(name = "back_image_url", length = 500)
    private String backImageUrl;

    @Size(max = 20)
    @NotNull
    @ColumnDefault("'PENDING'")
    @Column(name = "verify_status", nullable = false, length = 20)
    private String verifyStatus;

    @Size(max = 500)
    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Customer verifiedBy;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @NotNull
    @ColumnDefault("vn_now()")
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;


}