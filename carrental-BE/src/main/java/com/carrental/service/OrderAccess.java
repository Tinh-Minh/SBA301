package com.carrental.service;

import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.exception.AppException;
import com.carrental.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

/** Kiểm tra người gọi JWT có đúng vai trò với một đơn thuê hay không. */
@Component
@RequiredArgsConstructor
public class OrderAccess {

    private final CurrentUserService currentUserService;

    public Customer requireUser() {
        return currentUserService.getCurrentUser();
    }

    public boolean isAdmin(Customer customer) {
        return currentUserService.isAdmin(customer);
    }

    public void requireAdmin() {
        if (!isAdmin(requireUser())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được thực hiện thao tác này");
        }
    }

    public void requireRenter(RentalOrder order) {
        Customer user = requireUser();
        if (isRenter(order, user)) return;
        throw new AppException(HttpStatus.FORBIDDEN, "Chỉ người thuê của đơn này mới được thực hiện thao tác này");
    }

    public void requireOwner(RentalOrder order) {
        Customer user = requireUser();
        if (isOwner(order, user)) return;
        throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe của đơn này mới được thực hiện thao tác này");
    }

    public void requireRenterOrAdmin(RentalOrder order) {
        Customer user = requireUser();
        if (isAdmin(user) || isRenter(order, user)) return;
        throw new AppException(HttpStatus.FORBIDDEN, "Bạn không được thực hiện thao tác này");
    }

    public void requireOwnerOrAdmin(RentalOrder order) {
        Customer user = requireUser();
        if (isAdmin(user) || isOwner(order, user)) return;
        throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe hoặc admin được thực hiện thao tác này");
    }

    public void requireParty(RentalOrder order) {
        Customer user = requireUser();
        if (isAdmin(user) || isRenter(order, user) || isOwner(order, user)) return;
        throw new AppException(HttpStatus.FORBIDDEN, "Bạn không thuộc đơn thuê này");
    }

    public void requireSelf(Long requestedId) {
        Customer user = requireUser();
        if (isAdmin(user)) return;
        if (requestedId != null && !user.getId().equals(requestedId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Không được dùng danh tính của người khác");
        }
    }

    public boolean isRenter(RentalOrder order, Customer user) {
        return order != null && order.getCustomer() != null && user.getId().equals(order.getCustomer().getId());
    }

    public boolean isOwner(RentalOrder order, Customer user) {
        return order != null && order.getCar() != null && order.getCar().getOwner() != null
                && user.getId().equals(order.getCar().getOwner().getId());
    }
}
