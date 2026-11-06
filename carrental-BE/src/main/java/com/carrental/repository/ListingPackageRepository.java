package com.carrental.repository;

import com.carrental.entity.ListingPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ListingPackageRepository extends JpaRepository<ListingPackage, Long> {
    Optional<ListingPackage> findByCode(String code);
    List<ListingPackage> findAllByIsActiveTrueOrderByPriorityLevelDesc();
}

