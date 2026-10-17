package com.carrental.dto.request.bankaccount;

import com.carrental.config.CustomerProperties;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.MultiValueMap;

/** Strict paging contract for an authenticated customer's own bank accounts. */
public record BankAccountListQuery(int page, int size, String sortField, Sort.Direction direction) {
    private static final Set<String> ALLOWED = Set.of("page", "size", "sort");
    private static final Set<String> SORT_FIELDS = Set.of("id", "createdAt", "isDefault");

    public static BankAccountListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        if (parameters == null || !ALLOWED.containsAll(parameters.keySet())) throw invalid();
        int page = integer(value(parameters, "page", "0"));
        int size = integer(value(parameters, "size", Integer.toString(properties.getDefaultPageSize())));
        if (page < 0 || size <= 0 || size > properties.getMaxPageSize()
                || (long) page * size > Integer.MAX_VALUE) throw invalid();
        String[] parts = value(parameters, "sort", "createdAt,desc").split(",", -1);
        if (parts.length != 2) throw invalid();
        String field = parts[0].trim();
        if (!SORT_FIELDS.contains(field)) throw invalid();
        Sort.Direction direction;
        try { direction = Sort.Direction.fromString(parts[1].trim().toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException exception) { throw invalid(); }
        return new BankAccountListQuery(page, size, field, direction);
    }

    public Pageable pageable() {
        Sort sort = Sort.by(direction, sortField);
        if (!"id".equals(sortField)) sort = sort.and(Sort.by(direction, "id"));
        return PageRequest.of(page, size, sort);
    }

    private static String value(MultiValueMap<String, String> values, String key, String defaultValue) {
        var items = values.get(key);
        if (items == null) return defaultValue;
        if (items.size() != 1 || items.getFirst() == null) throw invalid();
        return items.getFirst().trim();
    }

    private static int integer(String value) {
        if (value == null || !value.matches("[0-9]+")) throw invalid();
        try { return Integer.parseInt(value); }
        catch (NumberFormatException exception) { throw invalid(); }
    }

    private static AppException invalid() { return new AppException(ErrorCode.INVALID_REQUEST); }
}
