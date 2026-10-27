package com.carrental.repository;

import com.carrental.entity.RentalOrder;
import com.carrental.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
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

    /** Một đơn kèm người thuê, xe, chủ xe, slot, voucher, người huỷ (nạp cùng lúc, tránh N+1 query). */
    @EntityGraph(attributePaths = {"customer", "car", "car.owner", "carSlot", "voucher", "cancelledBy"})
    Optional<RentalOrder> findWithDetailsById(Long id);

    /**
     * Danh sách đơn có phân trang, mọi điều kiện đều tuỳ chọn (null = bỏ qua):
     * customerId = đơn tôi thuê, ownerId = đơn trên xe của tôi, cả hai null = admin xem tất cả.
     */
    @EntityGraph(attributePaths = {"customer", "car", "car.owner", "carSlot", "voucher", "cancelledBy"})
    @Query("""
            select o from RentalOrder o
            where (:customerId is null or o.customer.id = :customerId)
              and (:ownerId is null or o.car.owner.id = :ownerId)
              and (:status is null or o.status = :status)
            """)
    Page<RentalOrder> search(@Param("customerId") Long customerId,
                             @Param("ownerId") Long ownerId,
                             @Param("status") OrderStatus status,
                             Pageable pageable);

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
