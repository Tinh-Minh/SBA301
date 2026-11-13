package com.carrental.controller;

import com.carrental.dto.booking.BookingDtos.*;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.HandoverType;
import com.carrental.service.BookingService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** Đơn thuê xe và biên bản bàn giao. */
@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final com.carrental.service.RentalDashboardService dashboardService;

    // ---------------------------------------------------------------- công khai

    @GetMapping("/api/cars/{carId}/quote")
    public ApiResponse<QuoteResponse> quote(
            @PathVariable Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupAt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime returnAt) {
        return ApiResponse.ok(bookingService.quote(carId, pickupAt, returnAt));
    }

    @GetMapping("/api/cars/{carId}/availability")
    public ApiResponse<List<BusyRange>> availability(@PathVariable Long carId) {
        return ApiResponse.ok(bookingService.availability(carId));
    }

    // ---------------------------------------------------------------- khách

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER')")
    @PostMapping("/api/bookings")
    public ApiResponse<BookingResponse> create(@Valid @RequestBody CreateBookingRequest request) {
        return ApiResponse.ok("Đã gửi yêu cầu thuê xe, chủ xe sẽ liên hệ với bạn", bookingService.create(request));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER')")
    @GetMapping("/api/bookings/my")
    public ApiResponse<List<BookingResponse>> mine() {
        return ApiResponse.ok(bookingService.mineAsCustomer());
    }

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/api/bookings/owner")
    public ApiResponse<List<BookingResponse>> ownerBookings() {
        return ApiResponse.ok(bookingService.mineAsOwner());
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/bookings/{id}")
    public ApiResponse<BookingResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(bookingService.get(id));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/bookings/{id}/cancel")
    public ApiResponse<BookingResponse> cancel(@PathVariable Long id, @Valid @RequestBody ReasonRequest request) {
        return ApiResponse.ok("Đã huỷ đơn thuê", bookingService.cancel(id, request.reason()));
    }

    // ---------------------------------------------------------------- chủ xe

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/bookings/{id}/contacted")
    public ApiResponse<BookingResponse> contacted(@PathVariable Long id, @Valid @RequestBody ContactRequest request) {
        return ApiResponse.ok("Đã ghi nhận đã liên hệ khách", bookingService.markContacted(id, request));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/bookings/{id}/accept")
    public ApiResponse<BookingResponse> accept(@PathVariable Long id) {
        return ApiResponse.ok("Đã xác nhận đơn thuê", bookingService.accept(id));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/bookings/{id}/reject")
    public ApiResponse<BookingResponse> reject(@PathVariable Long id, @Valid @RequestBody ReasonRequest request) {
        return ApiResponse.ok("Đã từ chối yêu cầu thuê", bookingService.reject(id, request.reason()));
    }

    // ---------------------------------------------------------------- biên bản

    @PreAuthorize("hasRole('OWNER')")
    @PostMapping(path = "/api/bookings/{id}/handovers/{type}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BookingResponse> submitHandover(@PathVariable Long id, @PathVariable HandoverType type,
                                                       @Valid @RequestPart("data") SubmitHandoverRequest request,
                                                       @RequestPart("photos") List<MultipartFile> photos) {
        return ApiResponse.ok("Đã gửi biên bản cho khách xác nhận", bookingService.submitHandover(id, type, request, photos));
    }

    @PreAuthorize("hasRole('OWNER')")
    @PutMapping(path = "/api/bookings/{id}/handovers/{type}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BookingResponse> reviseHandover(@PathVariable Long id, @PathVariable HandoverType type,
                                                       @Valid @RequestPart("data") ReviseHandoverRequest request,
                                                       @RequestPart("photos") List<MultipartFile> photos) {
        return ApiResponse.ok("Đã gửi lại biên bản đã chỉnh sửa", bookingService.reviseHandover(id, type, request, photos));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER')")
    @PostMapping("/api/bookings/{id}/handovers/{type}/respond")
    public ApiResponse<BookingResponse> respondHandover(@PathVariable Long id, @PathVariable HandoverType type,
                                                        @Valid @RequestBody RespondHandoverRequest request) {
        return ApiResponse.ok("Đã gửi phản hồi biên bản", bookingService.respondHandover(id, type, request));
    }

    // ---------------------------------------------------------------- admin

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/bookings")
    public ApiResponse<PageResponse<BookingResponse>> adminList(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long carId,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(bookingService.adminList(status, carId, q, PageRequestFactory.of(page, size, "id,desc")));
    }

    // ---------------------------------------------------------------- bảng theo dõi

    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/api/dashboards/owner")
    public ApiResponse<OwnerDashboardResponse> ownerDashboard() {
        return ApiResponse.ok(dashboardService.owner());
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER')")
    @GetMapping("/api/dashboards/customer")
    public ApiResponse<CustomerDashboardResponse> customerDashboard() {
        return ApiResponse.ok(dashboardService.customer());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/bookings/stats")
    public ApiResponse<AdminBookingStats> adminStats() {
        return ApiResponse.ok(dashboardService.admin());
    }
}
