package com.carrental.enums;

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
import com.carrental.dto.response.safety.*;

/** Mức an toàn tổng hợp hiển thị cho khách thuê. */
public enum SafetyLevel { SAFE, ATTENTION, UNSAFE, UNKNOWN }
