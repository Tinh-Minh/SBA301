package com.carrental.service;

import com.carrental.entity.Customer;
import java.util.Optional;

/**
 * Người dùng của request hiện tại, lấy từ JWT trong SecurityContext.
 * Header X-User-Id không còn được dùng làm danh tính.
 */
public interface CurrentUserService {

    /** @throws com.carrental.exception.UnauthorizedException nếu chưa đăng nhập */
    Customer getCurrentUser();

    Optional<Customer> optionalCurrentUser();

    boolean isAdmin(Customer customer);
}
