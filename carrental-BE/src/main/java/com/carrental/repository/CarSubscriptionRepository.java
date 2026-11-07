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

    Optional<CarSubscription> findBySubscriptionCode(String code);

    List<CarSubscription> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Page<CarSubscription> findAllByCustomerId(Long customerId, Pageable pageable);

    List<CarSubscription> findByCarIdOrderByCreatedAtDesc(Long carId);

    Page<CarSubscription> findAllByCarId(Long carId, Pageable pageable);

    Optional<CarSubscription> findTopByCarIdAndStatusOrderByEndDateDesc(Long carId, SubscriptionStatus status);

    List<CarSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime dateTime);

    boolean existsByCarIdAndStatus(Long carId, SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);

    long countByListingPackageIdAndStatus(Long listingPackageId, SubscriptionStatus status);
}
