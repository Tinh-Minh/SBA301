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
}
