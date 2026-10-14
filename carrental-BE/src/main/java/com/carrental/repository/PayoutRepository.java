package com.carrental.repository;

import com.carrental.entity.Payout;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayoutRepository extends JpaRepository<Payout, Long>, JpaSpecificationExecutor<Payout> {
    Page<Payout> findByRecipientId(Long recipientId, Pageable pageable);
    Page<Payout> findByOrderId(Long orderId, Pageable pageable);
    Page<Payout> findByStatus(String status, Pageable pageable);
    Optional<Payout> findByOrderId(Long orderId);
}
