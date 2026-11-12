package com.carrental.config;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/** Configurable limits for customer administration endpoints. */
@Validated
@ConfigurationProperties(prefix = "app.customer")
public class CustomerProperties {

    @Min(1)
    private int defaultPageSize = 20;

    @Min(1)
    private int maxPageSize = 100;

    @Min(1)
    private int statusReasonMaxLength = 500;

    public int getDefaultPageSize() {
        return defaultPageSize;
    }
    public void setDefaultPageSize(int defaultPageSize) {
        this.defaultPageSize = defaultPageSize;
    }
    public int getMaxPageSize() {
        return maxPageSize;
    }
    public void setMaxPageSize(int maxPageSize) {
        this.maxPageSize = maxPageSize;
    }
    public int getStatusReasonMaxLength() {
        return statusReasonMaxLength;
    }
    public void setStatusReasonMaxLength(int statusReasonMaxLength) {
        this.statusReasonMaxLength = statusReasonMaxLength;
    }

    @jakarta.validation.constraints.AssertTrue(message = "default page size must not exceed maximum page size")
    public boolean isDefaultPageSizeWithinMaximum() {

        return defaultPageSize <= maxPageSize;
    }
}
