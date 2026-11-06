package com.carrental.repository;

import com.carrental.entity.CarSubscription;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Collection;

@Repository
public interface CarSubscriptionRepository extends JpaRepository<CarSubscription, Long> {

    interface VoucherUsageCount {
        Long getVoucherId();
        Long getUsageCount();
    }

    /**
     * Counts non-cancelled and non-refunded subscription uses for the current customer.
     * Pending payment reserves a voucher slot; F3 must revalidate under the voucher row lock
     * when it creates or cancels a purchase.
     */
    @Query("select s.voucher.id as voucherId, count(s) as usageCount "
            + "from CarSubscription s where s.customer.id = :customerId and s.voucher.id in :voucherIds "
            + "and s.status <> :cancelled and s.paymentStatus <> :refunded group by s.voucher.id")
    List<VoucherUsageCount> countVoucherUsesByCustomerIdAndVoucherIds(
            @Param("customerId") Long customerId, @Param("voucherIds") Collection<Long> voucherIds,
            @Param("cancelled") SubscriptionStatus cancelled, @Param("refunded") PaymentStatus refunded);

    @EntityGraph(attributePaths = {"customer", "car", "listingPackage", "voucher"})
    Optional<CarSubscription> findWithDetailsById(Long id);

    Page<CarSubscription> findAllByCustomerId(Long customerId, Pageable pageable);

    Page<CarSubscription> findAllByCarId(Long carId, Pageable pageable);

    List<CarSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime dateTime);

    boolean existsByCarIdAndStatus(Long carId, SubscriptionStatus status);

    boolean existsByListingPackage_Id(Long listingPackageId);
}
