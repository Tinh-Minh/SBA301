package com.carrental.service.impl;

import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.ForbiddenException;
import com.carrental.exception.UnauthorizedException;
import com.carrental.repository.CustomerRepository;
import com.carrental.service.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * TẠM THỜI cho Function 3 khi Function 1 chưa có JWT: lấy id người dùng từ header "X-User-Id".
 * Khi Function 1 xong đăng nhập JWT, thay class này bằng bản đọc SecurityContextHolder
 * (chỉ cần cài đặt lại CurrentUserService, code đơn thuê không phải sửa).
 */
@Service
public class HeaderCurrentUserServiceImpl implements CurrentUserService {

    public static final String USER_ID_HEADER = "X-User-Id";

    private final CustomerRepository customerRepository;

    public HeaderCurrentUserServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    public Customer getCurrentUser() {
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs == null) {
            throw new UnauthorizedException("Không xác định được người dùng");
        }
        HttpServletRequest request = attrs.getRequest();
        String header = request.getHeader(USER_ID_HEADER);
        if (header == null || header.isBlank()) {
            throw new UnauthorizedException("Vui lòng đăng nhập (thiếu header " + USER_ID_HEADER + ")");
        }
        long id;
        try {
            id = Long.parseLong(header.trim());
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Header " + USER_ID_HEADER + " không hợp lệ");
        }
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new UnauthorizedException("Tài khoản không tồn tại"));
        if (customer.getStatus() == CustomerStatus.LOCKED) {
            throw new ForbiddenException("Tài khoản đã bị khóa");
        }
        return customer;
    }

    @Override
    public boolean isAdmin(Customer customer) {
        return customer != null && customer.getRole() == Role.ADMIN;
    }
}
