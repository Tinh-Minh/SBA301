package com.carrental.service;

import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Booking;
import com.carrental.enums.BookingStatus;
import com.carrental.enums.HandoverType;
import com.carrental.enums.TransactionType;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

public interface BookingService {

    QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt);

    QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, String voucherCode);

    /** Báo giá kèm phí giao xe tới toạ độ khách chọn (bỏ trống toạ độ = tự lấy xe). */
    QuoteResponse quote(Long carId, LocalDateTime pickupAt, LocalDateTime returnAt, String voucherCode,
            java.math.BigDecimal deliveryLatitude, java.math.BigDecimal deliveryLongitude);

    List<BusyRange> availability(Long carId);

    Set<Long> busyCarIds(LocalDateTime from, LocalDateTime to);

    void validateWindow(LocalDateTime pickupAt, LocalDateTime returnAt);

    BookingResponse create(CreateBookingRequest request);

    BookingResponse cancel(Long id, String reason);

    BigDecimal amountDue(Booking b, TransactionType type);

    void applyPayment(com.carrental.entity.Transaction tx);

    BookingResponse reportCustomerNoShow(Long id);

    BookingResponse reportOwnerNoShow(Long id);

    BookingResponse reportReturned(Long id);

    BookingResponse markContacted(Long id, ContactRequest request);

    BookingResponse accept(Long id);

    BookingResponse reject(Long id, String reason);

    BookingResponse submitHandover(Long id, HandoverType type, SubmitHandoverRequest request, List<MultipartFile> photos);

    BookingResponse respondHandover(Long id, HandoverType type, RespondHandoverRequest request);

    BookingResponse reviseHandover(Long id, HandoverType type, ReviseHandoverRequest request, List<MultipartFile> photos);

    BookingResponse get(Long id);

    List<BookingResponse> mineAsCustomer();

    List<BookingResponse> mineAsOwner();

    PageResponse<BookingResponse> adminList(BookingStatus status, Long carId, String q, Pageable pageable);

    boolean hasCompletedTrip(Long carId, Long customerId);

    int expireStaleRequests();

    int cancelUnpaidDeposits();

    BookingResponse toResponse(Booking b);
}
