package com.carrental.repository;

import com.carrental.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {
    Page<Transaction> findByOrderId(Long orderId, Pageable pageable);
    Page<Transaction> findByTransactionType(String transactionType, Pageable pageable);
    Page<Transaction> findByStatus(String status, Pageable pageable);
    List<Transaction> findByOrderId(Long orderId);
}
