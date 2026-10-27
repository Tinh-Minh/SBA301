package com.carrental.controller;

import com.carrental.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

/** Tạo Pageable từ query ?page=0&size=10&sortBy=createdAt&direction=desc, chỉ cho sort theo cột cho phép. */
final class PageableFactory {

    private static final Set<String> ORDER_SORT_FIELDS =
            Set.of("createdAt", "startTime", "endTime", "totalAmount", "status", "orderCode");
    private static final int MAX_SIZE = 100;

    private PageableFactory() {

    }

    static Pageable forOrders(int page, int size, String sortBy, String direction) {
        if (page < 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "page phải >= 0");
        }
        if (size < 1 || size > MAX_SIZE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "size phải từ 1 đến " + MAX_SIZE);
        }
        if (!ORDER_SORT_FIELDS.contains(sortBy)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Không hỗ trợ sắp xếp theo '" + sortBy + "', chọn một trong " + ORDER_SORT_FIELDS);
        }
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(page, size, Sort.by(dir, sortBy).and(Sort.by(Sort.Direction.DESC, "id")));
    }
}
