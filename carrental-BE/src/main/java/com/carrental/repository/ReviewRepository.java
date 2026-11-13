package com.carrental.repository;

import com.carrental.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {

    @EntityGraph(attributePaths = {"customer", "car"})
    List<Review> findByCarIdOrderByCreatedAtDesc(Long carId);

    @EntityGraph(attributePaths = {"customer", "car"})
    List<Review> findByCarIdAndApprovedTrueOrderByCreatedAtDesc(Long carId);

    boolean existsByCarIdAndCustomerId(Long carId, Long customerId);

    boolean existsByBookingId(Long bookingId);

    Page<Review> findByCarId(Long carId, Pageable pageable);

    Page<Review> findByCustomerId(Long customerId, Pageable pageable);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.car.id = :carId")
    Double getAverageRatingByCarId(@Param("carId") Long carId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.car.id = :carId AND r.approved = true")
    Double getApprovedAverageRatingByCarId(@Param("carId") Long carId);

    long countByCarIdAndApprovedTrue(Long carId);
}
