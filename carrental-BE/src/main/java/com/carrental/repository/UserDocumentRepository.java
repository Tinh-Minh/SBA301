package com.carrental.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentType;
import com.carrental.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface UserDocumentRepository extends JpaRepository<UserDocument, Long>, JpaSpecificationExecutor<UserDocument> {

    Optional<UserDocument> findByIdAndCustomerId(Long id, Long customerId);

    List<UserDocument> findByCustomerId(Long customerId);

    boolean existsByDocTypeAndDocNumberAndVerifyStatus(
            DocumentType docType, String docNumber, VerificationStatus verifyStatus);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<UserDocument> findWithLockById(Long id);

    @Query("select d.customer.id from UserDocument d where d.id = :id")
    Optional<Long> findCustomerIdById(@Param("id") Long id);
}
