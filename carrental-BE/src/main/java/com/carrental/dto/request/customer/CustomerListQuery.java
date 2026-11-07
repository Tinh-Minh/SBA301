package com.carrental.dto.request.customer;

import com.carrental.config.CustomerProperties;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.util.ListQueryParser;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;

/** Validated and allowlisted query for the admin customer search. */
public record CustomerListQuery(
        CustomerStatus status,
        KycStatus kycStatus,
        String keyword,
        Pageable pageable) {

    private static final Set<String> ALLOWED_PARAMETERS = Set.of("status", "kycStatus", "keyword", "page", "size", "sort");
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "fullName", "email", "createdAt", "updatedAt", "status", "kycStatus");

    public static CustomerListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        ListQueryParser.requireAllowed(parameters, ALLOWED_PARAMETERS);
        CustomerStatus status = ListQueryParser.enumValue(parameters, "status", CustomerStatus.class);
        KycStatus kyc = ListQueryParser.enumValue(parameters, "kycStatus", KycStatus.class);
        String keyword = ListQueryParser.value(parameters, "keyword", null);
        if (keyword != null) {
            if (keyword.isEmpty()) keyword = null;
            else if (keyword.length() > 150) throw ListQueryParser.invalid();
        }
        return new CustomerListQuery(status, kyc, keyword, ListQueryParser.pageable(
                parameters, properties.getDefaultPageSize(), properties.getMaxPageSize(), ALLOWED_SORT_FIELDS));
    }
}
