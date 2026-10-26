package com.carrental.repository;

import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car> {

    Optional<Car> findByLicensePlate(String licensePlate);

    boolean existsByLicensePlateIgnoreCase(String licensePlate);

    boolean existsByLicensePlateIgnoreCaseAndIdNot(String licensePlate, Long id);

    Page<Car> findAllByOwnerId(Long ownerId, Pageable pageable);

    Page<Car> findAllByOwnerIdAndStatus(Long ownerId, CarStatus status, Pageable pageable);

    Page<Car> findAllByStatus(CarStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"owner", "driver"})
    Optional<Car> findWithOwnerById(Long id);
}
