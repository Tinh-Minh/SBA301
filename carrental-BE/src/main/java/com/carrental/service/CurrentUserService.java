package com.carrental.service;

import com.carrental.entity.Customer;

/**
 * Lấy người dùng đang gọi API.
 * Function 3 chỉ phụ thuộc vào interface này; Function 1 cung cấp bản cài đặt đọc từ JWT.
 */
public interface CurrentUserService {

    /** @throws com.carrental.exception.UnauthorizedException nếu chưa đăng nhập */
    Customer getCurrentUser();

    boolean isAdmin(Customer customer);
}
