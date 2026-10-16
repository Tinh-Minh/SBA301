package com.carrental.repository;

import java.util.Optional;
import java.time.LocalDate;

import com.carrental.entity.Customer;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.query.Param;

/** Persistence queries for customer accounts. */
public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    @Query("select c from Customer c where lower(c.email) = lower(:email)")
    Optional<Customer> findByEmailIgnoreCase(@Param("email") String email);

    @Query("select count(c) > 0 from Customer c where lower(c.email) = lower(:email)")
    boolean existsByEmailIgnoreCase(@Param("email") String email);

    /** One database statement gives current account state and the identity-document aggregates. */
    @Query(value = """
            select c.id as "customerId", c.role as "accountRole", c.status as "accountStatus",
                   coalesce(bool_or(d.verify_status = 'APPROVED'
                       and (d.expires_at is null or d.expires_at >= :today)), false) as "hasValidApprovedIdentity",
                   coalesce(bool_or(d.verify_status = 'PENDING'), false) as "hasPendingIdentity",
                   coalesce(bool_or(d.verify_status = 'REJECTED'), false) as "hasRejectedIdentity"
            from customers c
            left join user_documents d on d.customer_id = c.id
                and d.doc_type in ('CITIZEN_ID', 'PASSPORT')
            where c.id = :customerId
            group by c.id, c.role, c.status
            """, nativeQuery = true)
    Optional<KycEvidenceProjection> findKycEvidence(@Param("customerId") long customerId,
            @Param("today") LocalDate today);

    /** A single snapshot statement for F1 driver current eligibility and activation evidence. */
    @Query(value = """
            select c.id as "customerId", c.role as "accountRole", c.status as "accountStatus",
                   dr.id as "driverId", dr.status as "driverStatus",
                   coalesce(identity.has_valid_approved_identity, false) as "hasValidApprovedIdentity",
                   coalesce(identity.has_pending_identity, false) as "hasPendingIdentity",
                   coalesce(identity.has_rejected_identity, false) as "hasRejectedIdentity",
                   coalesce(license.has_valid_driver_license, false) as "hasValidDriverLicense"
            from customers c
            left join drivers dr on dr.customer_id = c.id
            left join lateral (
                select bool_or(d.verify_status = 'APPROVED'
                           and (d.expires_at is null or d.expires_at >= :today)) as has_valid_approved_identity,
                       bool_or(d.verify_status = 'PENDING') as has_pending_identity,
                       bool_or(d.verify_status = 'REJECTED') as has_rejected_identity
                from user_documents d
                where d.customer_id = c.id and d.doc_type in ('CITIZEN_ID', 'PASSPORT')
            ) identity on true
            left join lateral (
                select bool_or(d.verify_status = 'APPROVED' and d.expires_at is not null
                       and d.expires_at >= :today
                       and nullif(btrim(d.license_class, cast(:javaWhitespaceCharacters as text)), '') is not null)
                           as has_valid_driver_license
                from user_documents d
                where d.customer_id = c.id and d.doc_type = 'DRIVER_LICENSE'
            ) license on true
            where c.id = :customerId
            """, nativeQuery = true)
    Optional<DriverEligibilityProjection> findDriverEligibility(@Param("customerId") long customerId,
            @Param("today") LocalDate today,
            @Param("javaWhitespaceCharacters") String javaWhitespaceCharacters);

    boolean existsByPhone(String phone);

    long countByRoleAndStatus(com.carrental.enums.Role role, com.carrental.enums.CustomerStatus status);

    /** The caller must hold a transaction for the lifetime of this pessimistic lock. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select c from Customer c where c.id = :id")
    Optional<Customer> findByIdForUpdate(@Param("id") Long id);
}
