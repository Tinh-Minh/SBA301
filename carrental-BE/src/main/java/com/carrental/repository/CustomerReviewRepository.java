package com.carrental.repository;

import com.carrental.entity.CustomerReview;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

    Optional<CustomerReview> findByBookingId(Long bookingId);

    List<CustomerReview> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM CustomerReview r WHERE r.customerId = :customerId")
    Double averageRating(@Param("customerId") Long customerId);

    long countByCustomerId(Long customerId);
}
