package com.carrental.repository;

import com.carrental.entity.CustomerReview;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerReviewRepository extends JpaRepository<CustomerReview, Long> {

    Optional<CustomerReview> findByBookingId(Long bookingId);

    List<CustomerReview> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<CustomerReview> findByCustomerIdAndApprovedTrueOrderByCreatedAtDesc(Long customerId);

    List<CustomerReview> findByOwnerIdOrderByCreatedAtDesc(Long ownerId);

    Page<CustomerReview> findAllByOrderByIdDesc(Pageable pageable);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM CustomerReview r WHERE r.customerId = :customerId AND r.approved = true")
    Double averageRating(@Param("customerId") Long customerId);

    long countByCustomerIdAndApprovedTrue(Long customerId);

    @Modifying
    @Query("UPDATE CustomerReview r SET r.approved = true WHERE r.approved = false AND r.createdAt < :cutoff")
    int approveCreatedBefore(@Param("cutoff") LocalDateTime cutoff);
}
