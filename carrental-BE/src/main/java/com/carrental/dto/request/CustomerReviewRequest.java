package com.carrental.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.web.bind.annotation.*;
import com.carrental.dto.response.*;

public record CustomerReviewRequest(
        @NotNull(message = "Vui lòng chọn số sao")
        @Min(value = 1, message = "Số sao tối thiểu là 1") @Max(value = 5, message = "Số sao tối đa là 5")
        @tools.jackson.databind.annotation.JsonDeserialize(using = com.carrental.validation.StrictIntegerDeserializer.class)
        Integer rating,
        @Size(max = 1000, message = "Nhận xét tối đa 1000 ký tự") String comment) {}
