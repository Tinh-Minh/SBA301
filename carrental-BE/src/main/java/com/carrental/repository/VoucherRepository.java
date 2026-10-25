package com.carrental.repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;

import java.util.Optional;

import com.carrental.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VoucherRepository extends JpaRepository<Voucher, Long>, JpaSpecificationExecutor<Voucher> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCode(String code);

    boolean existsByCodeIgnoreCase(String code);

    @Modifying(flushAutomatically = true)
    @Query("update Voucher v set v.usedCount = v.usedCount + 1 "
            + "where v.id = :id and (v.usageLimit is null or v.usedCount < v.usageLimit)")
    int increaseUsage(@Param("id") Long id);

    @Modifying(flushAutomatically = true)
    @Query("update Voucher v set v.usedCount = v.usedCount - 1 where v.id = :id and v.usedCount > 0")
    int decreaseUsage(@Param("id") Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Voucher> findWithLockById(Long id);
}
