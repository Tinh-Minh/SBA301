package com.carrental.repository;

import com.carrental.entity.CarSubscription;
import com.carrental.enums.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarSubscriptionRepository extends JpaRepository<CarSubscription, Long> {
    Optional<CarSubscription> findBySubscriptionCode(String code);

    List<CarSubscription> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<CarSubscription> findByCarIdOrderByCreatedAtDesc(Long carId);

    Optional<CarSubscription> findTopByCarIdAndStatusOrderByEndDateDesc(Long carId, SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);

    long countByListingPackageIdAndStatus(Long listingPackageId, SubscriptionStatus status);
}

