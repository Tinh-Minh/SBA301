package com.carrental.repository;

import java.util.Optional;

import com.carrental.entity.BankAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    Optional<BankAccount> findByIdAndCustomerId(Long id, Long customerId);

    Page<BankAccount> findAllByCustomerId(Long customerId, Pageable pageable);

    Optional<BankAccount> findByCustomerIdAndIsDefaultTrue(Long customerId);

    boolean existsByCustomerIdAndBankNameAndAccountNumber(Long customerId, String bankName, String accountNumber);
}
