package com.carrental.dto.request.driver;

import com.carrental.config.CustomerProperties;
import com.carrental.enums.DriverStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.MultiValueMap;

/** Database-backed admin filters with a strict query and sort allowlist. */
public record DriverListQuery(DriverStatus status, Long customerId, int page, int size,
        String sortField, Sort.Direction sortDirection) {

    private static final Set<String> ALLOWED_PARAMETERS = Set.of("status", "customerId", "page", "size", "sort");
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt", "updatedAt", "status");

    public static DriverListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        if (parameters == null || !ALLOWED_PARAMETERS.containsAll(parameters.keySet())) throw invalidRequest();
        DriverStatus status = enumValue(value(parameters, "status", null));
        Long customerId = null;
        String customerIdValue = value(parameters, "customerId", null);
        if (customerIdValue != null) {
            long parsed = longInteger(customerIdValue);
            if (parsed <= 0) throw invalidRequest();
            customerId = parsed;
        }
        int page = integer(value(parameters, "page", "0"));
        int size = integer(value(parameters, "size", Integer.toString(properties.getDefaultPageSize())));
        if (page < 0 || size <= 0 || size > properties.getMaxPageSize()
                || (long) page * size > Integer.MAX_VALUE) throw invalidRequest();

        String sort = value(parameters, "sort", "createdAt,desc");
        String[] parts = sort.split(",", -1);
        if (parts.length != 2) throw invalidRequest();
        String field = parts[0].trim();
        if (!ALLOWED_SORT_FIELDS.contains(field)) throw invalidRequest();
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(parts[1].trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw invalidRequest();
        }
        return new DriverListQuery(status, customerId, page, size, field, direction);
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
        try { return Integer.parseInt(value); }
        catch (NumberFormatException exception) { throw invalidRequest(); }
    }

    private static long longInteger(String value) {
        if (value == null || !value.matches("[0-9]+")) throw invalidRequest();
        try { return Long.parseLong(value); }
        catch (NumberFormatException exception) { throw invalidRequest(); }
    }

    private static DriverStatus enumValue(String value) {
        if (value == null) return null;
        try { return DriverStatus.valueOf(value); }
        catch (IllegalArgumentException exception) { throw invalidRequest(); }
    }

    private static AppException invalidRequest() {
        return new AppException(ErrorCode.INVALID_REQUEST);
    }
}
