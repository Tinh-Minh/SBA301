package com.carrental.repository;

import com.carrental.entity.CarSubscription;
import com.carrental.enums.SubscriptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @EntityGraph(attributePaths = {"customer", "car", "listingPackage", "voucher"})
    Page<CarSubscription> findAllByCustomerId(Long customerId, Pageable pageable);

    List<CarSubscription> findByCarIdOrderByCreatedAtDesc(Long carId);

    Page<CarSubscription> findAllByCarId(Long carId, Pageable pageable);

    Optional<CarSubscription> findTopByCarIdAndStatusOrderByEndDateDesc(Long carId, SubscriptionStatus status);

    List<CarSubscription> findByStatusAndEndDateBefore(SubscriptionStatus status, LocalDateTime dateTime);

    boolean existsByCarIdAndStatus(Long carId, SubscriptionStatus status);

    /** Toàn bộ gói cho admin, lọc trạng thái nếu có (nạp sẵn quan hệ, tránh N+1). */
    @EntityGraph(attributePaths = {"customer", "car", "listingPackage", "voucher"})
    @Query("select s from CarSubscription s where (:status is null or s.status = :status)")
    Page<CarSubscription> search(@Param("status") SubscriptionStatus status, Pageable pageable);

    /** Các gói chờ thanh toán đã tạo quá lâu (job tự huỷ). */
    List<CarSubscription> findByStatusAndCreatedAtBefore(SubscriptionStatus status, LocalDateTime time);

    /** Số lần một khách đã dùng voucher (không tính các gói đã huỷ). */
    long countByVoucherIdAndCustomerIdAndStatusNot(Long voucherId, Long customerId, SubscriptionStatus status);

    long countByStatus(SubscriptionStatus status);

    long countByListingPackageIdAndStatus(Long listingPackageId, SubscriptionStatus status);
}
