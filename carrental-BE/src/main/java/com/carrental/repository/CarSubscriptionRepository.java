package com.carrental.repository;

import com.carrental.entity.CarSubscription;
import com.carrental.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarSubscriptionRepository extends JpaRepository<CarSubscription, Long> {

    @EntityGraph(attributePaths = {"customer", "car", "listingPackage", "voucher"})
    Optional<CarSubscription> findWithDetailsById(Long id);

    Page<CarSubscription> findAllByCustomerId(Long customerId, Pageable pageable);

    Page<CarSubscription> findAllByCarId(Long carId, Pageable pageable);

    List<CarSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime dateTime);

    boolean existsByCarIdAndStatus(Long carId, SubscriptionStatus status);
}
