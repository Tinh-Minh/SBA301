package com.carrental.dto.response.booking;

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
import com.carrental.dto.request.booking.*;

public record HandoverResponse(
        Long id, HandoverType type, HandoverStatus status, Integer odometerKm, Integer fuelPercent,
        String ownerNote, String customerNote, Integer revision, LocalDateTime submittedAt,
        LocalDateTime confirmedAt, List<HandoverItemResponse> items) {
    public static HandoverResponse from(Handover h) {
        return new HandoverResponse(h.getId(), h.getHandoverType(), h.getStatus(), h.getOdometerKm(),
                h.getFuelPercent(), h.getOwnerNote(), h.getCustomerNote(), h.getRevision(), h.getSubmittedAt(),
                h.getConfirmedAt(), h.getItems().stream().map(HandoverItemResponse::from).toList());
    }
}
