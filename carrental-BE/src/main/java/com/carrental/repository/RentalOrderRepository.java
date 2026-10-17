package com.carrental.repository;

import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface RentalOrderRepository extends JpaRepository<RentalOrder, Long> {

    Optional<RentalOrder> findByOrderCode(String orderCode);

    boolean existsByOrderCode(String orderCode);

    /** Đơn của người thuê, lọc theo trạng thái nếu có. */
    @Query("""
            select o from RentalOrder o
            where o.customer.id = :customerId
              and (:status is null or o.status = :status)
            """)
    Page<RentalOrder> findByRenter(@Param("customerId") Long customerId,
                                   @Param("status") OrderStatus status,
                                   Pageable pageable);

    /** Đơn trên các xe của một chủ xe, lọc theo trạng thái nếu có. */
    @Query("""
            select o from RentalOrder o
            where o.car.owner.id = :ownerId
              and (:status is null or o.status = :status)
            """)
    Page<RentalOrder> findByOwner(@Param("ownerId") Long ownerId,
                                  @Param("status") OrderStatus status,
                                  Pageable pageable);

    /** Admin xem toàn bộ, lọc theo trạng thái nếu có. */
    @Query("""
            select o from RentalOrder o
            where (:status is null or o.status = :status)
            """)
    Page<RentalOrder> findAllByStatus(@Param("status") OrderStatus status, Pageable pageable);

    /**
     * Có đơn đang hiệu lực nào của xe chồng lên khoảng [start, end) không.
     * Giống ràng buộc EXCLUDE rental_orders_no_overlap trong DB (tsrange mặc định là [)).
     */
    @Query("""
            select count(o) > 0 from RentalOrder o
            where o.car.id = :carId
              and o.status in :statuses
              and o.startTime < :endTime
              and o.endTime > :startTime
            """)
    boolean existsOverlapping(@Param("carId") Long carId,
                              @Param("startTime") LocalDateTime startTime,
                              @Param("endTime") LocalDateTime endTime,
                              @Param("statuses") Collection<OrderStatus> statuses);

    /** Các đơn PENDING đã quá hạn xác nhận (job tự chuyển EXPIRED). */
    List<RentalOrder> findByStatusAndExpiresAtBefore(OrderStatus status, LocalDateTime time);

    /** Số lần một khách đã dùng voucher (không tính các đơn đã bị huỷ/từ chối/hết hạn). */
    @Query("""
            select count(o) from RentalOrder o
            where o.voucher.id = :voucherId
              and o.customer.id = :customerId
              and o.status not in :releasedStatuses
            """)
    long countVoucherUsage(@Param("voucherId") Long voucherId,
                           @Param("customerId") Long customerId,
                           @Param("releasedStatuses") Collection<OrderStatus> releasedStatuses);
}
