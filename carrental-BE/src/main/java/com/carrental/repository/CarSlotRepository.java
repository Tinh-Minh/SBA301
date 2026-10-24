package com.carrental.repository;

import com.carrental.entity.CarSlot;
import com.carrental.enums.SlotStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CarSlotRepository extends JpaRepository<CarSlot, Long>, JpaSpecificationExecutor<CarSlot> {

    Page<CarSlot> findAllByCarId(Long carId, Pageable pageable);

    @EntityGraph(attributePaths = {"car"})
    @Query("SELECT s FROM CarSlot s WHERE s.id = :id")
    Optional<CarSlot> findWithCarById(@Param("id") Long id);

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM CarSlot s " +
           "WHERE s.car.id = :carId AND s.status <> :cancelledStatus " +
           "AND (s.startTime < :endTime AND s.endTime > :startTime)")
    boolean existsOverlappingSlot(
            @Param("carId") Long carId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cancelledStatus") SlotStatus cancelledStatus
    );

    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END FROM CarSlot s " +
           "WHERE s.car.id = :carId AND s.id <> :excludeSlotId AND s.status <> :cancelledStatus " +
           "AND (s.startTime < :endTime AND s.endTime > :startTime)")
    boolean existsOverlappingSlotExcluding(
            @Param("carId") Long carId,
            @Param("excludeSlotId") Long excludeSlotId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("cancelledStatus") SlotStatus cancelledStatus
    );
}
