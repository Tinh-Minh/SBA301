package com.carrental.repository;

import com.carrental.entity.CarSlot;
import com.carrental.enums.SlotStatus;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CarSlotRepository extends JpaRepository<CarSlot, Long>, JpaSpecificationExecutor<CarSlot> {

    Page<CarSlot> findAllByCarId(Long carId, Pageable pageable);

    @EntityGraph(attributePaths = {"car"})
    Optional<CarSlot> findWithCarById(Long id);

    boolean existsByCarIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Long carId,
            SlotStatus cancelledStatus,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    boolean existsByCarIdAndIdNotAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
            Long carId,
            Long excludeSlotId,
            SlotStatus cancelledStatus,
            LocalDateTime endTime,
            LocalDateTime startTime
    );

    default boolean existsOverlapping(Long carId, LocalDateTime startTime, LocalDateTime endTime, Long excludeSlotId) {
        return excludeSlotId == null
                ? existsByCarIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                        carId, SlotStatus.CANCELLED, endTime, startTime)
                : existsByCarIdAndIdNotAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                        carId, excludeSlotId, SlotStatus.CANCELLED, endTime, startTime);
    }
}
