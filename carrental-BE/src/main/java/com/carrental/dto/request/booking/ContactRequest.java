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

public record ContactRequest(
        @AssertTrue(message = "Vui lòng xác nhận đã liên hệ với khách") boolean contacted,
        @NotBlank(message = "Vui lòng ghi lại nội dung đã trao đổi với khách")
        @Size(max = 1000, message = "Nội dung tối đa 1000 ký tự") String contactNote) {}
