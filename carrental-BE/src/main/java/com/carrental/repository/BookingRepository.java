package com.carrental.repository;

import com.carrental.entity.Booking;
import com.carrental.enums.BookingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    /** Đơn đang giữ lịch xe và giao với khoảng [from, to). */
    @Query("select b from Booking b where b.car.id = :carId and b.status in :statuses "
            + "and b.pickupAt < :to and b.returnAt > :from")
    List<Booking> findOverlapping(@Param("carId") Long carId, @Param("from") LocalDateTime from,
                                  @Param("to") LocalDateTime to, @Param("statuses") Collection<BookingStatus> statuses);

    @Query("select b from Booking b where b.customer.id = :customerId and b.status in :statuses "
            + "and b.pickupAt < :to and b.returnAt > :from")
    List<Booking> findCustomerOverlapping(@Param("customerId") Long customerId, @Param("from") LocalDateTime from,
                                          @Param("to") LocalDateTime to, @Param("statuses") Collection<BookingStatus> statuses);

    long countByOwnerIdAndCancelledByAndCancelledAtAfter(Long ownerId, String cancelledBy, LocalDateTime after);

    List<Booking> findAllByStatusAndRentalPaymentStatus(BookingStatus status, com.carrental.enums.PaymentStatus rentalPaymentStatus);

    @Query("select distinct b.car.id from Booking b where b.status in :statuses "
            + "and b.pickupAt < :to and b.returnAt > :from")
    List<Long> findBusyCarIds(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to,
                              @Param("statuses") Collection<BookingStatus> statuses);

    @Query("select b from Booking b where b.car.id = :carId and b.status in :statuses and b.returnAt > :from "
            + "order by b.pickupAt")
    List<Booking> findUpcomingForCar(@Param("carId") Long carId, @Param("from") LocalDateTime from,
                                     @Param("statuses") Collection<BookingStatus> statuses);

    @EntityGraph(attributePaths = {"car", "customer", "owner"})
    List<Booking> findAllByOwnerIdOrderByPickupAtDesc(Long ownerId);

    @EntityGraph(attributePaths = {"car", "customer", "owner"})
    List<Booking> findAllByCustomerIdOrderByPickupAtDesc(Long customerId);

    List<Booking> findAllByStatusAndPickupAtBefore(BookingStatus status, LocalDateTime time);

    boolean existsByCarIdAndCustomerIdAndStatus(Long carId, Long customerId, BookingStatus status);

    long countByVoucherIdAndCustomerIdAndStatusNotIn(Long voucherId, Long customerId, Collection<BookingStatus> statuses);

    long countByStatus(BookingStatus status);

    long countByCustomerIdAndStatus(Long customerId, BookingStatus status);

    boolean existsByCustomerIdAndOwnerId(Long customerId, Long ownerId);

    List<Booking> findAllByCarIdAndCustomerIdAndStatusOrderByCompletedAtAsc(Long carId, Long customerId, BookingStatus status);

    List<Booking> findAllByStatusAndDepositStatus(BookingStatus status, com.carrental.enums.PaymentStatus depositStatus);

    boolean existsByBookingCode(String bookingCode);
}
