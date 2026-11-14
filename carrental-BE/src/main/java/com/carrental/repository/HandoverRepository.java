package com.carrental.repository;

import com.carrental.entity.Handover;
import com.carrental.enums.HandoverType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface HandoverRepository extends JpaRepository<Handover, Long> {

    Optional<Handover> findByBookingIdAndHandoverType(Long bookingId, HandoverType handoverType);

    List<Handover> findAllByBookingIdOrderByIdAsc(Long bookingId);
}
