package com.carrental.repository;

import com.carrental.entity.OrderHandover;
import com.carrental.enums.HandoverType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderHandoverRepository extends JpaRepository<OrderHandover, Long> {

    List<OrderHandover> findByOrderIdOrderByHandedAtAsc(Long orderId);

    Optional<OrderHandover> findByOrderIdAndHandoverType(Long orderId, HandoverType handoverType);

    boolean existsByOrderIdAndHandoverType(Long orderId, HandoverType handoverType);
}
