package com.carrental.repository;

import java.util.Optional;

import com.carrental.entity.Driver;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/** Queries for a customer's one-to-one driver profile. */
public interface DriverRepository extends JpaRepository<Driver, Long>, JpaSpecificationExecutor<Driver> {

    Optional<Driver> findByCustomer_Id(Long customerId);

    Optional<Driver> findByIdAndCustomer_Id(Long id, Long customerId);

    Page<Driver> findAllByCustomer_Id(Long customerId, Pageable pageable);

    boolean existsByCustomer_Id(Long customerId);

    /** Scalar owner discovery avoids locking the driver before its owning customer. */
    @Query("select d.customer.id from Driver d where d.id = :driverId")
    Optional<Long> findCustomerIdByDriverId(@Param("driverId") long driverId);

    /** Call after the shared advisory lock and owner row lock, inside the status transaction. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select d from Driver d where d.id = :driverId")
    Optional<Driver> findByIdForUpdate(@Param("driverId") long driverId);
}
