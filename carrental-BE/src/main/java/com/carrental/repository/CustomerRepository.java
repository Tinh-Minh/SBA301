package com.carrental.repository;

import com.carrental.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

/** TẠM THỜI cho Function 3 - Function 1 sẽ thay bằng repository đầy đủ. */
public interface CustomerRepository extends JpaRepository<Customer, Long> {
}
