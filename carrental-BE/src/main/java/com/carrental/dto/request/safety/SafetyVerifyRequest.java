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

public record SafetyVerifyRequest(
        @NotNull(message = "Vui lòng chọn kết quả xác minh") VerificationStatus verifyStatus,
        @Size(max = 500, message = "Lý do tối đa 500 ký tự") String rejectReason) {}
