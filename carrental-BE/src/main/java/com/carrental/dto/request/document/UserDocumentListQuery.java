package com.carrental.dto.request.document;

import com.carrental.config.DocumentProperties;
import com.carrental.enums.VerificationStatus;
import com.carrental.enums.DocumentType;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.util.Locale;
import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.util.MultiValueMap;

public record UserDocumentListQuery(
        String scope,
        Long customerId,
        DocumentType docType,
        VerificationStatus verifyStatus,
        int page,
        int size,
        String sortField,
        Sort.Direction sortDirection) {

    private static final Set<String> ALLOWED = Set.of("scope", "customerId", "docType", "verifyStatus", "page", "size", "sort");
    private static final Set<String> SORTS = Set.of("id", "createdAt", "updatedAt", "docType", "verifyStatus");

    public static UserDocumentListQuery parse(MultiValueMap<String, String> parameters, DocumentProperties properties) {
        if (!ALLOWED.containsAll(parameters.keySet())) throw invalid();
        String scope = value(parameters, "scope", "mine");
        if (!scope.equals("mine") && !scope.equals("all")) throw invalid();
        String customerText = value(parameters, "customerId", null);
        Long customerId = null;
        if (customerText != null) {
            if (!customerText.matches("[1-9][0-9]{0,18}")) throw invalid();
            try { customerId = Long.parseLong(customerText); }
            catch (NumberFormatException exception) { throw invalid(); }
        }
        DocumentType docType = enumValue(value(parameters, "docType", null), DocumentType.class);
        VerificationStatus status = enumValue(value(parameters, "verifyStatus", null), VerificationStatus.class);
        int page = integer(value(parameters, "page", "0"));
        int size = integer(value(parameters, "size", Integer.toString(properties.getList().getDefaultPageSize())));
        if (page < 0 || size <= 0 || size > properties.getList().getMaxPageSize()
                || (long) page * size > Integer.MAX_VALUE) throw invalid();
        String[] sort = value(parameters, "sort", "createdAt,desc").split(",", -1);
        if (sort.length != 2 || !SORTS.contains(sort[0])) throw invalid();
        Sort.Direction direction;
        try { direction = Sort.Direction.fromString(sort[1].toUpperCase(Locale.ROOT)); }
        catch (IllegalArgumentException exception) { throw invalid(); }
        return new UserDocumentListQuery(scope, customerId, docType, status, page, size, sort[0], direction);
    }

    public Pageable pageable() {
        Sort sort = Sort.by(sortDirection, sortField);
        if (!sortField.equals("id")) sort = sort.and(Sort.by(sortDirection, "id"));
        return PageRequest.of(page, size, sort);
    }

    private static String value(MultiValueMap<String, String> map, String key, String fallback) {
        var values = map.get(key);
        if (values == null) return fallback;
        if (values.size() != 1 || values.getFirst() == null) throw invalid();
        return values.getFirst().strip();
    }

    private static int integer(String value) {
        if (value == null || !value.matches("[0-9]+")) throw invalid();
        try { return Integer.parseInt(value); }
        catch (NumberFormatException exception) { throw invalid(); }
    }

    private static <T extends Enum<T>> T enumValue(String value, Class<T> type) {
        if (value == null) return null;
        try { return Enum.valueOf(type, value); }
        catch (IllegalArgumentException exception) { throw invalid(); }
    }

    private static AppException invalid() { return new AppException(ErrorCode.INVALID_REQUEST); }
}
