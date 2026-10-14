package com.carrental.repository;

import com.carrental.entity.ExtraFee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExtraFeeRepository extends JpaRepository<ExtraFee, Long>, JpaSpecificationExecutor<ExtraFee> {
    Page<ExtraFee> findByOrderId(Long orderId, Pageable pageable);
    Page<ExtraFee> findByStatus(String status, Pageable pageable);
    List<ExtraFee> findByOrderId(Long orderId);
}
