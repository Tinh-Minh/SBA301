package com.carrental.repository;

import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
import jakarta.persistence.LockModeType;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Long>, JpaSpecificationExecutor<UserDocument> {

    Optional<UserDocument> findByIdAndCustomerId(Long id, Long customerId);

    List<UserDocument> findByCustomerId(Long customerId);

    boolean existsByCustomerIdAndDocTypeAndVerifyStatus(
            Long customerId, DocumentType docType, VerificationStatus verifyStatus);

    boolean existsByCustomerIdAndDocTypeInAndVerifyStatus(
            Long customerId, Collection<DocumentType> docTypes, VerificationStatus verifyStatus);

    long countByCustomerIdAndDocTypeIn(Long customerId, Collection<DocumentType> docTypes);

    boolean existsByDocTypeAndDocNumberAndVerifyStatus(
            DocumentType docType, String docNumber, VerificationStatus verifyStatus);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserDocument> findWithLockById(Long id);

    @Query("SELECT DISTINCT d.customer.id FROM UserDocument d WHERE d.customer.id IN :customerIds AND d.docType IN :docTypes AND d.verifyStatus = :status")
    List<Long> findCustomerIdsWithPendingIdentity(
            @Param("customerIds") Collection<Long> customerIds,
            @Param("docTypes") Collection<DocumentType> docTypes,
            @Param("status") VerificationStatus status);
}
