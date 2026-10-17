package com.carrental.repository;

import java.util.List;
import java.util.Optional;
import java.util.Collection;

import com.carrental.entity.BankAccount;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

/** Owner-scoped bank account queries; no operation returns accounts across owners. */
public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    Optional<BankAccount> findByIdAndCustomer_Id(Long id, Long customerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from BankAccount b where b.id = :id and b.customer.id = :customerId")
    Optional<BankAccount> findOwnedByIdForUpdate(@Param("id") Long id, @Param("customerId") Long customerId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select b from BankAccount b where b.customer.id = :customerId and b.id in :ids order by b.id")
    java.util.List<BankAccount> findOwnedByIdsForUpdate(@Param("customerId") Long customerId,
            @Param("ids") Collection<Long> ids);

    Page<BankAccount> findAllByCustomer_Id(Long customerId, Pageable pageable);

    List<BankAccount> findAllByCustomer_IdOrderByCreatedAtDesc(Long customerId);

    Optional<BankAccount> findByCustomer_IdAndIsDefaultTrue(Long customerId);

    boolean existsByCustomer_IdAndBankNameAndAccountNumber(Long customerId, String bankName, String accountNumber);
}
