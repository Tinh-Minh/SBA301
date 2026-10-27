package com.carrental.repository;

import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    @Override
    Optional<Transaction> findById(Long id);

    /**
     * Khóa dòng giao dịch (Pessimistic Write Lock) để tránh race condition khi VNPay IPN và Return URL gọi đồng thời.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    @Query("select t from Transaction t where t.id = :id")
    Optional<Transaction> findByIdForUpdate(@Param("id") Long id);

    /**
     * Magic methods kiểm tra xem đơn hàng đã có giao dịch thành công của loại tương ứng chưa (Idempotency check).
     */
    boolean existsByOrderIdAndTransactionTypeAndStatus(Long orderId, TransactionType transactionType, TransactionStatus status);

    /**
     * Lấy giao dịch PENDING mới nhất của đơn hàng để lấy lại link thanh toán thay vì tạo trùng lặp.
     */
    Optional<Transaction> findFirstByOrderIdAndTransactionTypeAndStatusOrderByCreatedAtDesc(
            Long orderId, TransactionType transactionType, TransactionStatus status);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    Page<Transaction> findByOrderId(Long orderId, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    Page<Transaction> findByTransactionType(TransactionType transactionType, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    Page<Transaction> findByStatus(TransactionStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    Page<Transaction> findByOrderIdAndStatus(Long orderId, TransactionStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    Page<Transaction> findByOrderIdAndTransactionType(Long orderId, TransactionType transactionType, Pageable pageable);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    Page<Transaction> findByOrderIdAndTransactionTypeAndStatus(
            Long orderId, TransactionType transactionType, TransactionStatus status, Pageable pageable);

    List<Transaction> findByOrderId(Long orderId);

    List<Transaction> findByRefundOfId(Long refundOfId);

    List<Transaction> findByExtraFeeId(Long extraFeeId);

    @EntityGraph(attributePaths = {"order", "refundOf", "extraFee"})
    @Override
    Page<Transaction> findAll(Specification<Transaction> spec, Pageable pageable);
}
