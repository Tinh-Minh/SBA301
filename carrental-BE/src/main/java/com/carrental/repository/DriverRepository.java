package com.carrental.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

import com.carrental.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface DriverRepository extends JpaRepository<Driver, Long>, JpaSpecificationExecutor<Driver> {

    Optional<Driver> findByCustomerId(Long customerId);

    Optional<Driver> findByIdAndCustomerId(Long id, Long customerId);

    boolean existsByCustomerId(Long customerId);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Driver> findWithLockById(Long id);
}
