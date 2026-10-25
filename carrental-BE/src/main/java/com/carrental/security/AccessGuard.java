package com.carrental.security;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Id truyền vào phải trùng người dùng trong JWT. Header X-User-Id không được tin. */
@Component
@RequiredArgsConstructor
public class AccessGuard {

    private final CurrentUserService currentUserService;

    public Customer requireActiveUser(Long customerId) {
        Customer current = currentUserService.getCurrentUser();
        if (customerId == null || !current.getId().equals(customerId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Không được dùng danh tính của người khác");
        }
        if (current.getStatus() != CustomerStatus.ACTIVE) {
            throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đang bị khoá");
        }
        return current;
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
        return currentUserService.optionalCurrentUser()
                .filter(user -> user.getId().equals(customerId))
                .map(user -> user.getRole() == Role.ADMIN && user.getStatus() == CustomerStatus.ACTIVE)
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
