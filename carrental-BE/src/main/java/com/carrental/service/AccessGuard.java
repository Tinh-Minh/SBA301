package com.carrental.service;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

// TODO: Đổi sang CustomerService của Người 1 khi hoàn thành JWT
@Component
@RequiredArgsConstructor
public class AccessGuard {

    private final CustomerRepository customerRepository;

    public Customer requireActiveUser(Long customerId) {
        Customer u = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(HttpStatus.UNAUTHORIZED, "Không xác định được người dùng"));
        if (u.getStatus() != CustomerStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đang bị khoá");
        }
        return u;
    }

    public Customer requireAdmin(Long customerId) {
        Customer u = requireActiveUser(customerId);
        if (u.getRole() != Role.ADMIN) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được thực hiện thao tác này");
        }
        return u;
    }

    public boolean isAdmin(Long customerId) {
        if (customerId == null) return false;
        return customerRepository.findById(customerId)
                .map(u -> u.getRole() == Role.ADMIN && u.getStatus() == CustomerStatus.ACTIVE)
                .orElse(false);
    }

    public boolean isOwner(Car car, Long customerId) {
        return customerId != null && car.getOwner() != null && car.getOwner().getId().equals(customerId);
    }

    public void requireOwner(Car car, Long customerId) {
        if (!isOwner(car, customerId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không phải chủ của xe này");
        }
    }
}
