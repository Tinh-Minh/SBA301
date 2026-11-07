package com.carrental.repository;

import com.carrental.entity.ListingPackage;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListingPackageRepository extends JpaRepository<ListingPackage, Long> {
    List<ListingPackage> findAllByIsActiveTrueOrderByPriorityLevelDesc();
    List<ListingPackage> findAllByIsActiveTrueOrderByPriorityLevelDescIdAsc();
    List<ListingPackage> findAllByOrderByPriorityLevelDescIdAsc();
    Optional<ListingPackage> findByCode(String code);
    boolean existsByCode(String code);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<ListingPackage> findWithLockById(Long id);
}
