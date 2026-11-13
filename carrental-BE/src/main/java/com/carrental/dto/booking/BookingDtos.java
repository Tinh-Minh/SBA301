package com.carrental.dto.booking;

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

/** Request/response cho đơn thuê xe và biên bản bàn giao. */
public final class BookingDtos {

    private BookingDtos() {}

    static final String URL_REGEX = "^/(?!/)\\S+$";

    // ------------------------------------------------------------------ requests

    public record CreateBookingRequest(
            @NotNull(message = "Vui lòng chọn xe") Long carId,
            @NotNull(message = "Vui lòng chọn thời gian nhận xe") LocalDateTime pickupAt,
            @NotNull(message = "Vui lòng chọn thời gian trả xe") LocalDateTime returnAt,
            @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
            @Pattern(regexp = "^$|^\\s*(\\+84|0)[0-9]{9,10}\\s*$", message = "Số điện thoại không hợp lệ") String contactPhone,
            @Size(max = 1000, message = "Lời nhắn tối đa 1000 ký tự")
            @Pattern(regexp = "^[^<>]*$", message = "Lời nhắn không được chứa ký tự < hoặc >") String customerNote,
            @Size(max = 50, message = "Mã voucher tối đa 50 ký tự") String voucherCode) {}

    public record ContactRequest(
            @AssertTrue(message = "Vui lòng xác nhận đã liên hệ với khách") boolean contacted,
            @NotBlank(message = "Vui lòng ghi lại nội dung đã trao đổi với khách")
            @Size(max = 1000, message = "Nội dung tối đa 1000 ký tự") String contactNote) {}

    public record ReasonRequest(
            @NotBlank(message = "Vui lòng nhập lý do") @Size(max = 500, message = "Lý do tối đa 500 ký tự") String reason) {}

    public record HandoverItemInput(
            @NotNull(message = "Thiếu hạng mục") HandoverCategory category,
            @Size(max = 1000, message = "Mô tả tối đa 1000 ký tự") String conditionNote) {}

    public record SubmitHandoverRequest(
            @NotNull(message = "Vui lòng nhập số km trên đồng hồ")
            @Min(value = 0, message = "Số km không được âm") @Max(value = 2_000_000) Integer odometerKm,
            @NotNull(message = "Vui lòng nhập mức nhiên liệu/pin")
            @Min(value = 0, message = "Nhiên liệu từ 0 đến 100%") @Max(value = 100, message = "Nhiên liệu từ 0 đến 100%")
            Integer fuelPercent,
            @Size(max = 1000) String ownerNote,
            @Min(0) BigDecimal otherFeeAmount,
            @Size(max = 500) String otherFeeNote,
            @NotEmpty(message = "Biên bản cần ít nhất một hạng mục có ảnh") List<@Valid HandoverItemInput> items) {}

    public record ItemDecision(
            @NotNull Long itemId,
            boolean accepted,
            @Size(max = 1000, message = "Ghi chú tối đa 1000 ký tự") String disputeNote) {}

    public record RespondHandoverRequest(
            @NotEmpty(message = "Vui lòng xem và phản hồi các hạng mục") List<@Valid ItemDecision> decisions,
            @Size(max = 1000) String customerNote,
            /** Biên bản trả xe: khách không đồng ý số tiền phí phát sinh (ghi lý do vào customerNote). */
            Boolean disputeFees) {}

    public record ItemRevision(
            @NotNull Long itemId,
            @Size(max = 1000) String conditionNote) {}

    public record ReviseHandoverRequest(
            @Min(0) @Max(2_000_000) Integer odometerKm,
            @Min(0) @Max(100) Integer fuelPercent,
            @Size(max = 1000) String ownerNote,
            List<@Valid ItemRevision> revisions,
            @Min(0) BigDecimal otherFeeAmount,
            @Size(max = 500) String otherFeeNote) {}

    // ------------------------------------------------------------------ responses

    public record QuoteResponse(
            Long carId,
            LocalDateTime pickupAt,
            LocalDateTime returnAt,
            long totalHours,
            int rentalDays,
            int rentalHours,
            BigDecimal pricePerDay,
            BigDecimal weekendPricePerDay,
            BigDecimal pricePerHour,
            BigDecimal dayAmount,
            BigDecimal hourAmount,
            BigDecimal rentalAmount,
            BigDecimal depositAmount,
            Integer kmLimitPerDay,
            Integer includedKm,
            BigDecimal extraKmFee,
            BigDecimal lateFeePerHour,
            boolean available,
            String unavailableReason,
            List<String> breakdown,
            String voucherCode,
            BigDecimal discountAmount,
            BigDecimal payableRentalAmount) {

        public QuoteResponse(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, long totalHours,
                int rentalDays, int rentalHours, BigDecimal pricePerDay, BigDecimal weekendPricePerDay,
                BigDecimal pricePerHour, BigDecimal dayAmount, BigDecimal hourAmount, BigDecimal rentalAmount,
                BigDecimal depositAmount, Integer kmLimitPerDay, Integer includedKm, BigDecimal extraKmFee,
                BigDecimal lateFeePerHour, boolean available, String unavailableReason, List<String> breakdown) {
            this(carId, pickupAt, returnAt, totalHours, rentalDays, rentalHours, pricePerDay, weekendPricePerDay,
                    pricePerHour, dayAmount, hourAmount, rentalAmount, depositAmount, kmLimitPerDay, includedKm,
                    extraKmFee, lateFeePerHour, available, unavailableReason, breakdown, null, BigDecimal.ZERO, rentalAmount);
        }
    }

    public record BusyRange(LocalDateTime from, LocalDateTime to) {}

    public record HandoverItemResponse(
            Long id, HandoverCategory category, String categoryLabel, boolean required, String photoUrl,
            String conditionNote, HandoverItemStatus status, String disputeNote) {
        static HandoverItemResponse from(HandoverItem i) {
            return new HandoverItemResponse(i.getId(), i.getCategory(), i.getCategory().label(),
                    i.getCategory().required(), i.getPhotoUrl(), i.getConditionNote(), i.getStatus(), i.getDisputeNote());
        }
    }

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

    public record BookingResponse(
            Long id,
            String bookingCode,
            BookingStatus status,
            Long carId,
            String carName,
            String carLicensePlate,
            String carImageUrl,
            String pickupAddress,
            Long customerId,
            String customerName,
            String customerPhone,
            Long ownerId,
            String ownerName,
            String ownerPhone,
            LocalDateTime pickupAt,
            LocalDateTime returnAt,
            Integer rentalDays,
            Integer rentalHours,
            BigDecimal pricePerDay,
            BigDecimal pricePerHour,
            BigDecimal dayAmount,
            BigDecimal hourAmount,
            BigDecimal rentalAmount,
            BigDecimal depositAmount,
            Integer kmLimitPerDay,
            BigDecimal extraKmFee,
            BigDecimal lateFeePerHour,
            String customerNote,
            LocalDateTime ownerContactedAt,
            String contactNote,
            LocalDateTime confirmedAt,
            String rejectReason,
            String cancelReason,
            String cancelledBy,
            LocalDateTime pickedUpAt,
            LocalDateTime returnedAt,
            Integer pickupOdometerKm,
            Integer returnOdometerKm,
            BigDecimal extraKmAmount,
            BigDecimal lateAmount,
            BigDecimal otherFeeAmount,
            String otherFeeNote,
            BigDecimal finalAmount,
            LocalDateTime completedAt,
            LocalDateTime createdAt,
            boolean reviewed,
            List<HandoverResponse> handovers,
            String voucherCode,
            BigDecimal discountAmount,
            PaymentStatus depositStatus,
            BigDecimal remainingAmount) {

        public static BookingResponse from(Booking b, String imageUrl, boolean reviewed, List<Handover> handovers) {
            var car = b.getCar();
            // Số điện thoại hai bên chỉ hiện khi đơn còn hiệu lực (đã gửi yêu cầu trở đi), không lộ ra đơn bị từ chối.
            boolean sharePhones = b.getStatus() != BookingStatus.REJECTED && b.getStatus() != BookingStatus.EXPIRED;
            String vCode = b.getVoucher() != null ? b.getVoucher().getCode() : null;
            BigDecimal discount = b.getDiscountAmount() != null ? b.getDiscountAmount() : BigDecimal.ZERO;
            PaymentStatus depStatus = b.getDepositStatus() != null ? b.getDepositStatus() : PaymentStatus.UNPAID;
            BigDecimal rem = b.getFinalAmount();
            return new BookingResponse(
                    b.getId(), b.getBookingCode(), b.getStatus(),
                    car.getId(), (car.getBrand() + " " + car.getModel()).trim(), car.getLicensePlate(), imageUrl,
                    car.getPickupAddress(),
                    b.getCustomer().getId(), b.getCustomer().getFullName(),
                    sharePhones ? (b.getContactPhone() != null ? b.getContactPhone() : b.getCustomer().getPhone()) : null,
                    b.getOwner().getId(), b.getOwner().getFullName(),
                    sharePhones ? (car.getContactPhone() != null ? car.getContactPhone() : b.getOwner().getPhone()) : null,
                    b.getPickupAt(), b.getReturnAt(), b.getRentalDays(), b.getRentalHours(),
                    b.getPricePerDay(), b.getPricePerHour(), b.getDayAmount(), b.getHourAmount(), b.getRentalAmount(),
                    b.getDepositAmount(), b.getKmLimitPerDay(), b.getExtraKmFee(), b.getLateFeePerHour(),
                    b.getCustomerNote(), b.getOwnerContactedAt(), b.getContactNote(), b.getConfirmedAt(),
                    b.getRejectReason(), b.getCancelReason(), b.getCancelledBy(), b.getPickedUpAt(), b.getReturnedAt(),
                    b.getPickupOdometerKm(), b.getReturnOdometerKm(), b.getExtraKmAmount(), b.getLateAmount(),
                    b.getOtherFeeAmount(), b.getOtherFeeNote(), b.getFinalAmount(), b.getCompletedAt(), b.getCreatedAt(),
                    reviewed, handovers.stream().map(HandoverResponse::from).toList(),
                    vCode, discount, depStatus, rem);
        }
    }

    // ------------------------------------------------------------------ dashboards

    public record CarStat(
            Long carId,
            String carName,
            String licensePlate,
            String imageUrl,
            String carStatus,
            String listingStatus,
            String safetyLevel,
            long totalBookings,
            long pendingRequests,
            long activeBookings,
            long completedBookings,
            long cancelledBookings,
            BigDecimal revenue,
            BigDecimal upcomingRevenue,
            BigDecimal packageSpend,
            long rentedHours,
            Double averageRating,
            long reviewCount,
            LocalDateTime nextPickupAt,
            List<BookingResponse> recentBookings) {}

    public record MonthlyPoint(String month, BigDecimal revenue, long bookings) {}

    public record OwnerDashboardResponse(
            long totalCars,
            long approvedCars,
            long listedCars,
            long pendingRequests,
            long activeBookings,
            long completedBookings,
            BigDecimal totalRevenue,
            BigDecimal upcomingRevenue,
            BigDecimal packageSpend,
            BigDecimal netIncome,
            List<MonthlyPoint> monthly,
            List<CarStat> cars,
            List<BookingResponse> actionNeeded) {}

    public record CustomerDashboardResponse(
            long totalBookings,
            long upcomingBookings,
            long activeBookings,
            long completedBookings,
            long cancelledBookings,
            BigDecimal totalSpent,
            BigDecimal depositsHeld,
            long rentedHours,
            List<MonthlyPoint> monthly,
            List<BookingResponse> actionNeeded,
            List<BookingResponse> bookings) {}

    public record AdminBookingStats(
            long total,
            long requested,
            long confirmed,
            long inProgress,
            long completed,
            long cancelled,
            long disputedHandovers,
            BigDecimal completedValue,
            LocalDate from) {}
}
