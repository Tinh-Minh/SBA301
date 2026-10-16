package com.carrental.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.carrental.entity.base.AuditedEntity;
import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.UserDocumentType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/** Submitted identity or driving document and its review metadata. */
@Entity
@Table(name = "user_documents")
public class UserDocument extends AuditedEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false, length = 30)
    private UserDocumentType docType;

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
    private DocumentVerifyStatus verifyStatus = DocumentVerifyStatus.PENDING;

    @Column(name = "reject_reason", length = 500)
    private String rejectReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private Customer verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    public UserDocument() {
    }

    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public UserDocumentType getDocType() { return docType; }
    public void setDocType(UserDocumentType docType) { this.docType = docType; }
    public String getDocNumber() { return docNumber; }
    public void setDocNumber(String docNumber) { this.docNumber = docNumber; }
    public String getFullNameOnDoc() { return fullNameOnDoc; }
    public void setFullNameOnDoc(String fullNameOnDoc) { this.fullNameOnDoc = fullNameOnDoc; }
    public LocalDate getDateOfBirthOnDoc() { return dateOfBirthOnDoc; }
    public void setDateOfBirthOnDoc(LocalDate dateOfBirthOnDoc) { this.dateOfBirthOnDoc = dateOfBirthOnDoc; }
    public String getIssuePlace() { return issuePlace; }
    public void setIssuePlace(String issuePlace) { this.issuePlace = issuePlace; }
    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }
    public LocalDate getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDate expiresAt) { this.expiresAt = expiresAt; }
    public String getLicenseClass() { return licenseClass; }
    public void setLicenseClass(String licenseClass) { this.licenseClass = licenseClass; }
    public String getFrontImageUrl() { return frontImageUrl; }
    public void setFrontImageUrl(String frontImageUrl) { this.frontImageUrl = frontImageUrl; }
    public String getBackImageUrl() { return backImageUrl; }
    public void setBackImageUrl(String backImageUrl) { this.backImageUrl = backImageUrl; }
    public DocumentVerifyStatus getVerifyStatus() { return verifyStatus; }
    public void setVerifyStatus(DocumentVerifyStatus verifyStatus) { this.verifyStatus = verifyStatus; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
    public Customer getVerifiedBy() { return verifiedBy; }
    public void setVerifiedBy(Customer verifiedBy) { this.verifiedBy = verifiedBy; }
    public LocalDateTime getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(LocalDateTime verifiedAt) { this.verifiedAt = verifiedAt; }
}
