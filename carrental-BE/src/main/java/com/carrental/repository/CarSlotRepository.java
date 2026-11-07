package com.carrental.repository;

import com.carrental.entity.CarSlot;
import org.springframework.data.jpa.repository.JpaRepository;

/** TẠM THỜI cho Function 3 - Function 2 sẽ thay bằng repository đầy đủ. */
public interface CarSlotRepository extends JpaRepository<CarSlot, Long> {
}
