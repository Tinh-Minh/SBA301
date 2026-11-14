package com.carrental.dto.response.safety;

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
import com.carrental.dto.request.safety.*;
import com.carrental.enums.*;

public record SafetySummaryResponse(
        Long carId,
        SafetyLevel level,
        String headline,
        List<String> highlights,
        List<String> warnings,
        SafetyItem inspection,
        SafetyItem insurance,
        LocalDate lastMaintenanceAt,
        Integer lastMaintenanceOdometerKm,
        LocalDate nextMaintenanceDueAt,
        Integer latestOdometerKm,
        int repairCount,
        int verifiedRecordCount,
        int totalRecordCount,
        List<SafetyRecordResponse> records) {}
