package com.carrental.dto.request.customer;

import com.carrental.config.CustomerProperties;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.MultiValueMap;

/** Validated and allowlisted query for the admin customer search. */
public record CustomerListQuery(
        CustomerStatus status,
        KycStatus kycStatus,
        String keyword,
        int page,
        int size,
        String sortField,
        Sort.Direction sortDirection) {

    private static final Set<String> ALLOWED_PARAMETERS = Set.of("status", "kycStatus", "keyword", "page", "size", "sort");
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "fullName", "email", "createdAt", "updatedAt", "status", "kycStatus");

    public static CustomerListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        if (!ALLOWED_PARAMETERS.containsAll(parameters.keySet())) throw invalidRequest();

        CustomerStatus status = enumValue(value(parameters, "status", null), CustomerStatus.class);
        KycStatus kyc = enumValue(value(parameters, "kycStatus", null), KycStatus.class);
        String keyword = value(parameters, "keyword", null);
        if (keyword != null) {
            keyword = keyword.trim();
            if (keyword.isEmpty()) keyword = null;
            else if (keyword.length() > 150) throw invalidRequest();
        }

        int page = integer(value(parameters, "page", "0"));
        int size = integer(value(parameters, "size", Integer.toString(properties.getDefaultPageSize())));
        if (page < 0 || size <= 0 || size > properties.getMaxPageSize()
                || (long) page * size > Integer.MAX_VALUE) {
            throw invalidRequest();
        }

        String sort = value(parameters, "sort", "createdAt,desc");
        String[] parts = sort.split(",", -1);
        if (parts.length != 2) throw invalidRequest();
        String field = parts[0].trim();
        String direction = parts[1].trim();
        if (!ALLOWED_SORT_FIELDS.contains(field)) throw invalidRequest();
        Sort.Direction sortDirection;
        try {
            sortDirection = Sort.Direction.fromString(direction.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw invalidRequest();
        }
        return new CustomerListQuery(status, kyc, keyword, page, size, field, sortDirection);
    }

    public Pageable pageable() {
        Sort sort = Sort.by(sortDirection, sortField);
        if (!"id".equals(sortField)) sort = sort.and(Sort.by(sortDirection, "id"));
        return PageRequest.of(page, size, sort);
    }

    private static String value(MultiValueMap<String, String> parameters, String key, String defaultValue) {
        var values = parameters.get(key);
        if (values == null) return defaultValue;
        if (values.size() != 1 || values.getFirst() == null) throw invalidRequest();
        return values.getFirst().trim();
    }

    private static int integer(String value) {
        if (value == null || !value.matches("[0-9]+")) throw invalidRequest();
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            throw invalidRequest();
        }
    }

    private static <T extends Enum<T>> T enumValue(String value, Class<T> type) {
        if (value == null) return null;
        try {
            return Enum.valueOf(type, value);
        } catch (IllegalArgumentException exception) {
            throw invalidRequest();
        }
    }

    private static AppException invalidRequest() {
        return new AppException(ErrorCode.INVALID_REQUEST);
    }
}
