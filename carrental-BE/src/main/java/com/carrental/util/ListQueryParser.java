package com.carrental.util;

import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.MultiValueMap;

public final class ListQueryParser {

    private ListQueryParser() { }

    public static void requireAllowed(MultiValueMap<String, String> parameters, Set<String> allowed) {
        if (parameters == null || !allowed.containsAll(parameters.keySet())) {
            throw invalid();
        }
    }

    public static String optional(MultiValueMap<String, String> parameters, String key) {
        var values = parameters.get(key);
        if (values == null) return null;
        if (values.size() != 1 || values.getFirst() == null) throw invalid();
        return values.getFirst();
    }

    public static String value(MultiValueMap<String, String> parameters, String key, String defaultValue) {
        String raw = optional(parameters, key);
        return raw == null ? defaultValue : raw.strip();
    }

    public static int integer(String value) {
        if (value == null || !value.matches("[0-9]+")) throw invalid();
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException exception) {
            throw invalid();
        }
    }

    public static Long positiveLong(MultiValueMap<String, String> parameters, String key) {
        String raw = value(parameters, key, null);
        if (raw == null) return null;
        if (!raw.matches("[0-9]+")) throw invalid();
        try {
            long parsed = Long.parseLong(raw);
            if (parsed <= 0) throw invalid();
            return parsed;
        } catch (NumberFormatException exception) {
            throw invalid();
        }
    }

    public static <E extends Enum<E>> E enumValue(MultiValueMap<String, String> parameters, String key, Class<E> type) {
        String raw = value(parameters, key, null);
        if (raw == null) return null;
        try {
            return Enum.valueOf(type, raw);
        } catch (IllegalArgumentException exception) {
            throw invalid();
        }
    }

    public static boolean containsControlOrNul(String value) {
        return value.codePoints().anyMatch(cp -> cp == 0 || Character.isISOControl(cp));
    }

    public static Pageable pageable(MultiValueMap<String, String> parameters, int defaultSize, int maxSize,
            Set<String> allowedSortFields) {
        int page = integer(value(parameters, "page", "0"));
        int size = integer(value(parameters, "size", Integer.toString(defaultSize)));
        if (page < 0 || size <= 0 || size > maxSize || (long) page * size > Integer.MAX_VALUE) {
            throw invalid();
        }
        String[] parts = value(parameters, "sort", "createdAt,desc").split(",", -1);
        if (parts.length != 2) throw invalid();
        String field = parts[0].trim();
        if (!allowedSortFields.contains(field)) throw invalid();
        Sort.Direction direction;
        try {
            direction = Sort.Direction.fromString(parts[1].trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw invalid();
        }
        Sort sort = Sort.by(direction, field);
        if (!"id".equals(field)) sort = sort.and(Sort.by(direction, "id"));
        return PageRequest.of(page, size, sort);
    }

    public static AppException invalid() {
        return new AppException(ErrorCode.INVALID_REQUEST);
    }
}
