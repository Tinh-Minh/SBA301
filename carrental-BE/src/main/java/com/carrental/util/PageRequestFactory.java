package com.carrental.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Set;

public final class PageRequestFactory {
    public static final int MAX_SIZE = 50;

    private PageRequestFactory() {}

    public static Pageable of(int page, int size, String sortBy, String direction,
                              Set<String> allowedSortFields, String defaultSortBy) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_SIZE);
        String field = (sortBy != null && allowedSortFields.contains(sortBy)) ? sortBy : defaultSortBy;
        Sort.Direction dir = Sort.Direction.fromOptionalString(direction).orElse(Sort.Direction.DESC);
        return PageRequest.of(safePage, safeSize,
                Sort.by(new Sort.Order(dir, field), Sort.Order.asc("id")));
    }

    /** Như {@link #of(int, int, String)} nhưng chỉ nhận trường nằm trong whitelist; trường lạ trả 400 thay vì 500. */
    public static Pageable of(int page, int size, String sort, Set<String> allowedSortFields) {
        if (sort != null && !sort.isBlank()) {
            String field = sort.split(",")[0].trim();
            if (!allowedSortFields.contains(field)) {
                throw new com.carrental.exception.AppException(org.springframework.http.HttpStatus.BAD_REQUEST,
                        "Không hỗ trợ sắp xếp theo '" + field + "'");
            }
        }
        return of(page, size, sort);
    }

    public static Pageable of(int page, int size, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_SIZE);
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "id"));
        }
        String[] parts = sort.split(",");
        String field = parts[0].trim();
        Sort.Direction dir = (parts.length > 1 && parts[1].trim().equalsIgnoreCase("asc")) ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(dir, field));
    }
}
