package com.carrental.dto.request.booking;

import com.carrental.entity.Booking;
import com.carrental.entity.Handover;
import com.carrental.entity.HandoverItem;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.HandoverCategory;
import com.carrental.enums.HandoverItemStatus;
import com.carrental.enums.HandoverStatus;
import com.carrental.enums.HandoverType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.carrental.dto.response.booking.*;

public record RespondHandoverRequest(
        /** Có thể rỗng khi không còn hạng mục chờ (vd chủ xe chỉ điều chỉnh phí theo phản đối của khách). */
        List<@Valid ItemDecision> decisions,
        @Size(max = 1000) String customerNote,
        /** Biên bản trả xe: khách không đồng ý số tiền phí phát sinh (ghi lý do vào customerNote). */
        Boolean disputeFees) {}
