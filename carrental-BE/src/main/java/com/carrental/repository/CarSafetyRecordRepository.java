package com.carrental.repository;

import com.carrental.entity.CarSafetyRecord;
import com.carrental.enums.VerificationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarSafetyRecordRepository extends JpaRepository<CarSafetyRecord, Long> {

    List<CarSafetyRecord> findAllByCarIdOrderByPerformedAtDescIdDesc(Long carId);

    List<CarSafetyRecord> findAllByCarIdIn(List<Long> carIds);

    Optional<CarSafetyRecord> findByIdAndCarId(Long id, Long carId);

    @EntityGraph(attributePaths = {"car", "car.owner"})
    Page<CarSafetyRecord> findAllByVerifyStatus(VerificationStatus verifyStatus, Pageable pageable);

    @EntityGraph(attributePaths = {"car", "car.owner"})
    Page<CarSafetyRecord> findAllBy(Pageable pageable);

    long countByVerifyStatus(VerificationStatus verifyStatus);
}
