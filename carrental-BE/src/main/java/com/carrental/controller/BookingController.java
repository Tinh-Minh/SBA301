package com.carrental.controller;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;

import com.carrental.dto.request.BookingDepositPaymentRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.HandoverType;
import com.carrental.enums.PaymentMethod;
import com.carrental.service.BookingService;
import com.carrental.service.DashboardService;
import com.carrental.service.RentalDashboardService;
import com.carrental.service.TransactionService;
import com.carrental.util.PageRequestFactory;
import jakarta.servlet.http.HttpServletRequest;
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
    private final TransactionService transactionService;
    private final RentalDashboardService rentalDashboardService;
    private final DashboardService dashboardService;
    private final com.carrental.service.SettlementService settlementService;

    // ---------------------------------------------------------------- công khai

    @GetMapping("/api/cars/{carId}/quote")
    public ApiResponse<QuoteResponse> quote(
            @PathVariable Long carId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime pickupAt,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime returnAt,
            @RequestParam(required = false) String voucherCode) {
        return ApiResponse.ok(bookingService.quote(carId, pickupAt, returnAt, voucherCode));
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
    public ApiResponse<List<BookingResponse>> mine(@RequestParam(required = false) String sort) {
        return ApiResponse.ok(sortBookings(bookingService.mineAsCustomer(), sort));
    }

    /** Chỉ hỗ trợ sắp xếp theo createdAt/pickupAt; trường lạ trả 400 thay vì bị bỏ qua. */
    private static List<BookingResponse> sortBookings(List<BookingResponse> bookings, String sort) {
        if (sort == null || sort.isBlank()) {
            return bookings;
        }
        String[] parts = sort.split(",");
        java.util.Comparator<BookingResponse> comparator = switch (parts[0].trim()) {
            case "createdAt" -> java.util.Comparator.comparing(BookingResponse::createdAt,
                    java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
            case "pickupAt" -> java.util.Comparator.comparing(BookingResponse::pickupAt,
                    java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder()));
            default -> throw new com.carrental.exception.AppException(org.springframework.http.HttpStatus.BAD_REQUEST,
                    "Không hỗ trợ sắp xếp theo '" + parts[0].trim() + "'");
        };
        if (parts.length > 1 && "desc".equalsIgnoreCase(parts[1].trim())) {
            comparator = comparator.reversed();
        }
        return bookings.stream().sorted(comparator).toList();
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

    /** Khách báo đã trả xe: chốt thời điểm trả để tính phí trễ, chủ xe không thể kéo dài bằng cách lập biên bản muộn. */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/bookings/{id}/returned")
    public ApiResponse<BookingResponse> reportReturned(@PathVariable Long id) {
        return ApiResponse.ok("Đã ghi nhận thời điểm trả xe", bookingService.reportReturned(id));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/bookings/{id}/cancel")
    public ApiResponse<BookingResponse> cancel(@PathVariable Long id, @Valid @RequestBody ReasonRequest request) {
        return ApiResponse.ok("Đã huỷ đơn thuê", bookingService.cancel(id, request.reason()));
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    @PostMapping("/api/bookings/{id}/deposit-payment")
    public ApiResponse<TransactionResponse> payDeposit(
            @PathVariable Long id,
            @RequestParam(defaultValue = "VNPAY") PaymentMethod method,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán tiền cọc thành công",
                transactionService.createBookingDepositPayment(
                        new BookingDepositPaymentRequest(id, method, bankCode), request));
    }

    /** Thanh toán phần tiền thuê còn lại (sau cọc) qua hệ thống – bắt buộc trước khi nhận xe. */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/bookings/{id}/rental-payment")
    public ApiResponse<TransactionResponse> payRental(
            @PathVariable Long id,
            @RequestParam(defaultValue = "VNPAY") PaymentMethod method,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán tiền thuê còn lại",
                transactionService.createBookingPayment(new BookingDepositPaymentRequest(id, method, bankCode),
                        com.carrental.enums.TransactionType.BOOKING_PAYMENT, request));
    }

    /** Thanh toán phí phát sinh khi trả xe – chuyến hoàn tất sau khi thanh toán. */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/bookings/{id}/extra-fee-payment")
    public ApiResponse<TransactionResponse> payExtraFee(
            @PathVariable Long id,
            @RequestParam(defaultValue = "VNPAY") PaymentMethod method,
            @RequestParam(required = false) String bankCode,
            HttpServletRequest request) {
        return ApiResponse.ok("Tạo giao dịch thanh toán phí phát sinh",
                transactionService.createBookingPayment(new BookingDepositPaymentRequest(id, method, bankCode),
                        com.carrental.enums.TransactionType.BOOKING_EXTRA_FEE, request));
    }

    /** Khách báo chủ xe không giao xe (sau giờ nhận 1 giờ): hoàn 100% + đền bù, chủ xe bị phạt. */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/api/bookings/{id}/owner-no-show")
    public ApiResponse<BookingResponse> ownerNoShow(@PathVariable Long id) {
        return ApiResponse.ok("Đã ghi nhận chủ xe không giao xe", bookingService.reportOwnerNoShow(id));
    }

    /** Chủ xe báo khách không đến nhận xe (sau giờ nhận 2 giờ): tính phí huỷ như khách huỷ sát ngày. */
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/api/bookings/{id}/customer-no-show")
    public ApiResponse<BookingResponse> customerNoShow(@PathVariable Long id) {
        return ApiResponse.ok("Đã ghi nhận khách không đến nhận xe", bookingService.reportCustomerNoShow(id));
    }

    /** Các phiếu hoàn/chi trả/phạt của đơn (khách, chủ xe của đơn hoặc admin). */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/bookings/{id}/settlements")
    public ApiResponse<java.util.List<SlipResponse>> settlements(@PathVariable Long id) {
        bookingService.get(id); // kiểm tra quyền xem đơn
        return ApiResponse.ok(settlementService.forBooking(id));
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
                                                       @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
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
        return ApiResponse.ok(rentalDashboardService.owner());
    }

    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER')")
    @GetMapping("/api/dashboards/customer")
    public ApiResponse<CustomerDashboardResponse> customerDashboard() {
        return ApiResponse.ok(rentalDashboardService.customer());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/bookings/stats")
    public ApiResponse<AdminBookingStats> adminStats() {
        return ApiResponse.ok(dashboardService.admin());
    }
}
