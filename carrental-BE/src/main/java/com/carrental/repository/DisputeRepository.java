package com.carrental.repository;

import com.carrental.entity.Dispute;
import com.carrental.enums.DisputeStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DisputeRepository extends JpaRepository<Dispute, Long>, JpaSpecificationExecutor<Dispute> {
    Page<Dispute> findByOrderId(Long orderId, Pageable pageable);
    Page<Dispute> findByRaisedById(Long raisedById, Pageable pageable);
    Page<Dispute> findByStatus(DisputeStatus status, Pageable pageable);
    List<Dispute> findByOrderId(Long orderId);
}
