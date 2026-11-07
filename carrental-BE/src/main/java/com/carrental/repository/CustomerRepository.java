package com.carrental.repository;

import java.util.Optional;
import java.util.List;

import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;

public interface CustomerRepository extends JpaRepository<Customer, Long>, JpaSpecificationExecutor<Customer> {

    Optional<Customer> findByEmail(String email);

    Optional<Customer> findByPhone(String phone);

    Optional<Customer> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByPhone(String phone);

    long countByRoleAndStatus(Role role, CustomerStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Customer> findWithLockById(Long id);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<Customer> findWithLockByRoleOrderByIdAsc(Role role);

    boolean existsByIdAndRole(Long id, Role role);

    boolean existsByIdAndStatusAndRole(Long id, CustomerStatus status, Role role);
}
