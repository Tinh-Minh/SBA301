package com.carrental.repository;

import com.carrental.entity.BankAccount;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {

    Page<BankAccount> findAllByCustomer_Id(Long customerId, Pageable pageable);

    Optional<BankAccount> findByIdAndCustomer_Id(Long id, Long customerId);

    Optional<BankAccount> findByCustomer_IdAndIsDefaultTrue(Long customerId);
}
