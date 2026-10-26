package com.carrental.dto.request.bankaccount;

import com.carrental.config.CustomerProperties;
import com.carrental.util.ListQueryParser;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;

/** Strict paging contract for an authenticated customer's own bank accounts. */
public record BankAccountListQuery(Pageable pageable) {
    private static final Set<String> ALLOWED = Set.of("page", "size", "sort");
    private static final Set<String> SORT_FIELDS = Set.of("id", "createdAt", "isDefault");

    public static BankAccountListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        ListQueryParser.requireAllowed(parameters, ALLOWED);
        return new BankAccountListQuery(ListQueryParser.pageable(
                parameters, properties.getDefaultPageSize(), properties.getMaxPageSize(), SORT_FIELDS));
    }
}
