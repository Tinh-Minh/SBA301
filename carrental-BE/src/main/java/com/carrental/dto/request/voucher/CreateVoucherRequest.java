package com.carrental.dto.request.voucher;

import com.carrental.enums.DiscountType;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.format.ResolverStyle;
import java.time.temporal.ChronoField;
import java.util.Locale;
import tools.jackson.databind.JsonNode;

/** Strict JSON allowlist for creating a voucher definition. */
public final class CreateVoucherRequest {
    private static final DateTimeFormatter LOCAL_DATE_TIME = new DateTimeFormatterBuilder()
            .appendPattern("uuuu-MM-dd'T'HH:mm:ss")
            .optionalStart()
            .appendFraction(ChronoField.NANO_OF_SECOND, 1, 6, true)
            .optionalEnd()
            .toFormatter(Locale.ROOT)
            .withResolverStyle(ResolverStyle.STRICT);

    private boolean codePresent;
    private boolean descriptionPresent;
    private boolean discountTypePresent;
    private boolean discountValuePresent;
    private boolean maxDiscountPresent;
    private boolean minOrderAmountPresent;
    private boolean startAtPresent;
    private boolean endAtPresent;
    private boolean usageLimitPresent;
    private boolean perUserLimitPresent;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscount;
    private BigDecimal minOrderAmount = BigDecimal.ZERO;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer usageLimit;
    private Integer perUserLimit = 1;

    @JsonProperty("code")
    public void setCode(JsonNode value) {
        duplicate(codePresent);
        codePresent = true;
        code = requiredText(value, "code");
    }

    @JsonProperty("description")
    public void setDescription(JsonNode value) {
        duplicate(descriptionPresent);
        descriptionPresent = true;
        description = nullableText(value, "description");
    }

    @JsonProperty("discountType")
    public void setDiscountType(JsonNode value) {
        duplicate(discountTypePresent);
        discountTypePresent = true;
        String raw = requiredText(value, "discountType");
        try {
            discountType = DiscountType.valueOf(raw);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("discountType is invalid");
        }
    }

    @JsonProperty("discountValue")
    public void setDiscountValue(JsonNode value) {
        duplicate(discountValuePresent);
        discountValuePresent = true;
        discountValue = decimal(value, "discountValue", false);
    }

    @JsonProperty("maxDiscount")
    public void setMaxDiscount(JsonNode value) {
        duplicate(maxDiscountPresent);
        maxDiscountPresent = true;
        maxDiscount = decimal(value, "maxDiscount", true);
    }

    @JsonProperty("minOrderAmount")
    public void setMinOrderAmount(JsonNode value) {
        duplicate(minOrderAmountPresent);
        minOrderAmountPresent = true;
        minOrderAmount = decimal(value, "minOrderAmount", false);
    }

    @JsonProperty("startAt")
    public void setStartAt(JsonNode value) {
        duplicate(startAtPresent);
        startAtPresent = true;
        startAt = localDateTime(value, "startAt");
    }

    @JsonProperty("endAt")
    public void setEndAt(JsonNode value) {
        duplicate(endAtPresent);
        endAtPresent = true;
        endAt = localDateTime(value, "endAt");
    }

    @JsonProperty("usageLimit")
    public void setUsageLimit(JsonNode value) {
        duplicate(usageLimitPresent);
        usageLimitPresent = true;
        usageLimit = integer(value, "usageLimit", true);
    }

    @JsonProperty("perUserLimit")
    public void setPerUserLimit(JsonNode value) {
        duplicate(perUserLimitPresent);
        perUserLimitPresent = true;
        perUserLimit = integer(value, "perUserLimit", false);
    }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown voucher field");
    }

    public boolean codeWasProvided() { return codePresent; }
    public boolean discountTypeWasProvided() { return discountTypePresent; }
    public boolean discountValueWasProvided() { return discountValuePresent; }
    public boolean startAtWasProvided() { return startAtPresent; }
    public boolean endAtWasProvided() { return endAtPresent; }
    public String getCode() { return code; }
    public String getDescription() { return description; }
    public DiscountType getDiscountType() { return discountType; }
    public BigDecimal getDiscountValue() { return discountValue; }
    public BigDecimal getMaxDiscount() { return maxDiscount; }
    public BigDecimal getMinOrderAmount() { return minOrderAmount; }
    public LocalDateTime getStartAt() { return startAt; }
    public LocalDateTime getEndAt() { return endAt; }
    public Integer getUsageLimit() { return usageLimit; }
    public Integer getPerUserLimit() { return perUserLimit; }

    static String requiredText(JsonNode value, String field) {
        if (value == null || !value.isTextual()) throw new IllegalArgumentException(field + " must be a string");
        return value.stringValue();
    }

    static String nullableText(JsonNode value, String field) {
        if (value == null || value.isNull()) return null;
        if (!value.isTextual()) throw new IllegalArgumentException(field + " must be a string or null");
        return value.stringValue();
    }

    static BigDecimal decimal(JsonNode value, String field, boolean nullable) {
        if (value == null || value.isNull()) {
            if (nullable) return null;
            throw new IllegalArgumentException(field + " must be a JSON number");
        }
        if (!value.isNumber()) throw new IllegalArgumentException(field + " must be a JSON number");
        return value.decimalValue();
    }

    static Integer integer(JsonNode value, String field, boolean nullable) {
        if (value == null || value.isNull()) {
            if (nullable) return null;
            throw new IllegalArgumentException(field + " must be an integer");
        }
        if (!value.isIntegralNumber()) throw new IllegalArgumentException(field + " must be an integer");
        BigInteger integer = value.bigIntegerValue();
        if (integer.compareTo(BigInteger.valueOf(Integer.MIN_VALUE)) < 0
                || integer.compareTo(BigInteger.valueOf(Integer.MAX_VALUE)) > 0) {
            throw new IllegalArgumentException(field + " is outside the integer range");
        }
        return integer.intValue();
    }

    static LocalDateTime localDateTime(JsonNode value, String field) {
        String raw = requiredText(value, field);
        try {
            LocalDateTime parsed = LocalDateTime.parse(raw, LOCAL_DATE_TIME);
            if (parsed.getYear() < 1 || parsed.getYear() > 9999) throw new IllegalArgumentException(field + " year is invalid");
            return parsed;
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException(field + " must be a strict local date-time");
        }
    }

    private static void duplicate(boolean alreadyPresent) {
        if (alreadyPresent) throw new IllegalArgumentException("Repeated voucher field");
    }
}
