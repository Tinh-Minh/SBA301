package com.carrental.repository;

import com.carrental.entity.CarImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarImageRepository extends JpaRepository<CarImage, Long> {

    List<CarImage> findAllByCarIdOrderBySortOrderAsc(Long carId);

    Optional<CarImage> findByCarIdAndIsPrimaryTrue(Long carId);

    Optional<CarImage> findFirstByCarIdOrderBySortOrderAsc(Long carId);

    long countByCarId(Long carId);

    @Query("SELECT i FROM CarImage i WHERE i.car.id IN :carIds AND i.isPrimary = true")
    List<CarImage> findPrimaryImages(@Param("carIds") Collection<Long> carIds);
}
