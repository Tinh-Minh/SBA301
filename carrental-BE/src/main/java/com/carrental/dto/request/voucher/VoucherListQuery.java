package com.carrental.dto.request.voucher;

import com.carrental.config.CustomerProperties;
import com.carrental.enums.DiscountType;
import com.carrental.enums.VoucherStatus;
import com.carrental.enums.VoucherWindowState;
import com.carrental.util.ListQueryParser;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.util.MultiValueMap;

/** Strict, database-backed voucher list filters and pagination. */
public record VoucherListQuery(String code, VoucherStatus status, DiscountType discountType,
        VoucherWindowState window, Pageable pageable) {
    private static final Set<String> ALLOWED = Set.of("code", "status", "discountType", "window", "page", "size", "sort");
    private static final Set<String> SORT_FIELDS = Set.of("id", "code", "createdAt", "updatedAt", "startAt", "endAt", "usedCount");

    public static VoucherListQuery parse(MultiValueMap<String, String> parameters, CustomerProperties properties) {
        ListQueryParser.requireAllowed(parameters, ALLOWED);
        String code = ListQueryParser.optional(parameters, "code");
        if (code != null) {
            code = code.strip();
            if (code.isEmpty() || code.codePointCount(0, code.length()) > 50 || ListQueryParser.containsControlOrNul(code)) {
                throw ListQueryParser.invalid();
            }
        }
        VoucherStatus status = ListQueryParser.enumValue(parameters, "status", VoucherStatus.class);
        DiscountType type = ListQueryParser.enumValue(parameters, "discountType", DiscountType.class);
        VoucherWindowState window = ListQueryParser.enumValue(parameters, "window", VoucherWindowState.class);
        return new VoucherListQuery(code, status, type, window, ListQueryParser.pageable(
                parameters, properties.getDefaultPageSize(), properties.getMaxPageSize(), SORT_FIELDS));
    }
}
