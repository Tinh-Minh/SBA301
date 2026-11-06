package com.carrental.repository;

import com.carrental.entity.Review;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long>, JpaSpecificationExecutor<Review> {

    // Magic Method (Spring Data Derived Query)
    @EntityGraph(attributePaths = {"customer", "car"})
    List<Review> findByCarIdOrderByCreatedAtDesc(Long carId);

    // Magic Method (Spring Data Derived Query)
    boolean existsByCarIdAndCustomerId(Long carId, Long customerId);

    // Explicit @Query method
    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.car.id = :carId")
    Double getAverageRatingByCarId(@Param("carId") Long carId);
}
