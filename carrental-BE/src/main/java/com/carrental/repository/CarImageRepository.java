package com.carrental.repository;

import com.carrental.entity.CarImage;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarImageRepository extends JpaRepository<CarImage, Long> {

    List<CarImage> findAllByCarIdOrderBySortOrderAsc(Long carId);

    Optional<CarImage> findByCarIdAndIsPrimaryTrue(Long carId);

    Optional<CarImage> findFirstByCarIdOrderBySortOrderAsc(Long carId);

    long countByCarId(Long carId);

    List<CarImage> findAllByCarIdInAndIsPrimaryTrue(Collection<Long> carIds);
}
