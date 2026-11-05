package com.carrental.repository;

import com.carrental.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {
    Page<Review> findByCarId(Long carId, Pageable pageable);
    Page<Review> findByCustomerId(Long customerId, Pageable pageable);
    boolean existsByCarIdAndCustomerId(Long carId, Long customerId);
}
