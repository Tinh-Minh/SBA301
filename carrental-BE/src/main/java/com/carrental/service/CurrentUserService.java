package com.carrental.service;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import java.util.Optional;

/**
 * Người dùng của request hiện tại, lấy từ JWT trong SecurityContext.
 * Header X-User-Id không còn được dùng làm danh tính.
 */
public interface CurrentUserService {

    /** @throws com.carrental.exception.AppException nếu chưa đăng nhập hoặc tài khoản bị khoá */
    Customer getCurrentUser();

    Optional<Customer> optionalCurrentUser();

    boolean isAdmin(Customer customer);

    boolean isOwner(Car car, Customer customer);
}
