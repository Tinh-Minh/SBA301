package com.carrental.repository;

import com.carrental.entity.ActionLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActionLogRepository extends JpaRepository<ActionLog, Long> {

    List<ActionLog> findByOrderIdOrderByCreatedAtAscIdAsc(Long orderId);
}
