package com.carrental.dto.request.safety;

import com.carrental.entity.CarSafetyRecord;
import com.carrental.enums.SafetyRecordResult;
import com.carrental.enums.SafetyRecordType;
import com.carrental.enums.VerificationStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.carrental.dto.response.safety.*;
import com.carrental.enums.*;

public record SafetyRecordRequest(
        @NotNull(message = "Vui lòng chọn loại bản ghi") SafetyRecordType recordType,
        @NotNull(message = "Vui lòng nhập ngày thực hiện")
        @PastOrPresent(message = "Ngày thực hiện không được ở tương lai") LocalDate performedAt,
        LocalDate expiresAt,
        @Size(max = 200, message = "Tên đơn vị tối đa 200 ký tự") String provider,
        @Size(max = 60, message = "Số chứng từ tối đa 60 ký tự") String referenceNumber,
        @Min(value = 0, message = "Số km không được âm")
        @Max(value = 2_000_000, message = "Số km không hợp lệ") Integer odometerKm,
        SafetyRecordResult result,
        @Size(max = 1000, message = "Ghi chú tối đa 1000 ký tự") String note) {}
