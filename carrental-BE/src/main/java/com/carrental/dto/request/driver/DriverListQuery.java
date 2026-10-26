package com.carrental.dto.request.driver;

import com.carrental.config.CustomerProperties;
import com.carrental.enums.DriverStatus;
import com.carrental.util.ListQueryParser;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;

/** Database-backed admin filters with a strict query and sort allowlist. */
public record DriverListQuery(DriverStatus status, Long customerId, Pageable pageable) {

    private static final Set<String> ALLOWED_PARAMETERS = Set.of("status", "customerId", "page", "size", "sort");
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("id", "createdAt", "updatedAt", "status");

    public static DriverListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        ListQueryParser.requireAllowed(parameters, ALLOWED_PARAMETERS);
        DriverStatus status = ListQueryParser.enumValue(parameters, "status", DriverStatus.class);
        Long customerId = ListQueryParser.positiveLong(parameters, "customerId");
        return new DriverListQuery(status, customerId, ListQueryParser.pageable(
                parameters, properties.getDefaultPageSize(), properties.getMaxPageSize(), ALLOWED_SORT_FIELDS));
    }
}
