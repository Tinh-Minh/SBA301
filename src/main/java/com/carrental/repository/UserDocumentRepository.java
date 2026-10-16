package com.carrental.repository;

import java.util.Optional;

import com.carrental.entity.UserDocument;
import com.carrental.enums.DocumentVerifyStatus;
import com.carrental.enums.UserDocumentType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Queries for customer-scoped and administrator-filtered documents. */
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long>, JpaSpecificationExecutor<UserDocument> {

    Optional<UserDocument> findByIdAndCustomer_Id(Long id, Long customerId);

    Page<UserDocument> findByCustomer_Id(Long customerId, Pageable pageable);

    Page<UserDocument> findByVerifyStatus(DocumentVerifyStatus verifyStatus, Pageable pageable);

    Optional<UserDocument> findFirstByDocTypeAndDocNumberAndVerifyStatus(
            UserDocumentType docType, String docNumber, DocumentVerifyStatus verifyStatus);

    /** Scalar owner discovery avoids loading an unlocked document entity before the ordered lock protocol. */
    @Query("select d.customer.id from UserDocument d where d.id = :id")
    Optional<Long> findOwnerIdByDocumentId(@Param("id") long id);

    /** Must be used after the owner lock and inside the shared F1 review/status transaction. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from UserDocument d where d.id = :id")
    Optional<UserDocument> findByIdForUpdate(@Param("id") long id);
}
