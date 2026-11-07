package com.carrental.service.impl;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.CurrentUserService;
import java.util.Optional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/** Đọc người dùng từ principal JWT. Header X-User-Id bị bỏ qua. */
@Service
public class CurrentUserServiceImpl implements CurrentUserService {

    private final CustomerRepository customerRepository;

    public CurrentUserServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Customer getCurrentUser() {
        return optionalCurrentUser()
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATION_FAILED, "Vui lòng đăng nhập"));
    }

    @Override
    public Optional<Customer> optionalCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CurrentAccount account)) {
            return Optional.empty();
        }
        Customer customer = customerRepository.findById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATION_FAILED, "Tài khoản không tồn tại"));
        if (customer.getStatus() == CustomerStatus.LOCKED) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Tài khoản đã bị khóa");
        }
        if (customer.getRole() != account.role()) {
            throw new AppException(ErrorCode.AUTHENTICATION_FAILED, "Phiên đăng nhập không còn hợp lệ");
        }
        return Optional.of(customer);
    }

    @Override
    public boolean isAdmin(Customer customer) {
        return customer != null && customer.getRole() == Role.ADMIN && customer.getStatus() == CustomerStatus.ACTIVE;
    }

    @Override
    public boolean isOwner(Car car, Customer customer) {
        return customer != null && car != null && car.getOwner() != null
                && car.getOwner().getId().equals(customer.getId());
    }
}
