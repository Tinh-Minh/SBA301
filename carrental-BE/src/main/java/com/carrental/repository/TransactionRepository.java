package com.carrental.repository;

import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long>, JpaSpecificationExecutor<Transaction> {

    @EntityGraph(attributePaths = {"subscription", "subscription.car", "subscription.listingPackage", "subscription.customer"})
    @Override
    Optional<Transaction> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @EntityGraph(attributePaths = {"subscription", "subscription.car", "subscription.listingPackage", "subscription.customer"})
    Optional<Transaction> findWithLockingById(Long id);

    default Optional<Transaction> findByIdForUpdate(Long id) {
        return findWithLockingById(id);
    }

    boolean existsBySubscriptionIdAndTransactionTypeAndStatus(Long subscriptionId, TransactionType transactionType, TransactionStatus status);

    Optional<Transaction> findFirstBySubscriptionIdAndTransactionTypeAndStatusOrderByCreatedAtDesc(
            Long subscriptionId, TransactionType transactionType, TransactionStatus status);

    List<Transaction> findAllBySubscriptionIdAndStatus(Long subscriptionId, TransactionStatus status);

    @EntityGraph(attributePaths = {"subscription", "subscription.car", "subscription.listingPackage", "subscription.customer"})
    List<Transaction> findTop10ByStatusOrderByCreatedAtDesc(TransactionStatus status);

    long countByStatusAndTransactionType(TransactionStatus status, TransactionType transactionType);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'SUCCESS' AND t.transactionType = 'PACKAGE_PAYMENT'")
    BigDecimal sumTotalRevenue();

    @Query("SELECT lp.id, lp.name, lp.code, COUNT(t), COALESCE(SUM(t.amount), 0) " +
           "FROM Transaction t " +
           "JOIN t.subscription s " +
           "JOIN s.listingPackage lp " +
           "WHERE t.status = 'SUCCESS' AND t.transactionType = 'PACKAGE_PAYMENT' " +
           "GROUP BY lp.id, lp.name, lp.code " +
           "ORDER BY SUM(t.amount) DESC")
    List<Object[]> findPackageRevenueStats();
}
