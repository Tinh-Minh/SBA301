package com.carrental.service.impl;

import com.carrental.service.*;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

import com.carrental.entity.Booking;
import com.carrental.entity.Customer;
import com.carrental.entity.CustomerReview;
import com.carrental.enums.BookingStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CustomerReviewRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Đánh giá chiều ngược lại: chủ xe đánh giá khách thuê sau chuyến hoàn tất.
 * Chủ xe dùng điểm uy tín của khách để quyết định nhận yêu cầu thuê.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerReviewServiceImpl implements CustomerReviewService {

    /** Đánh giá của chủ xe cho một đơn (null nếu chưa có) và uy tín chung của khách. */

    private final CustomerReviewRepository customerReviewRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public CustomerReviewItem create(Long bookingId, Integer rating, String comment) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + bookingId));
        if (!b.getOwner().getId().equals(user.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe của đơn này mới được đánh giá khách");
        }
        if (b.getStatus() != BookingStatus.COMPLETED) {
            throw new AppException(HttpStatus.CONFLICT, "Chỉ đánh giá khách sau khi chuyến thuê đã hoàn tất");
        }
        if (customerReviewRepository.findByBookingId(bookingId).isPresent()) {
            throw new AppException(HttpStatus.CONFLICT, "Bạn đã đánh giá khách cho chuyến này rồi");
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số sao từ 1 đến 5");
        }
        String text = comment == null ? null : comment.trim();
        if (text != null && (text.length() > 1000 || text.contains("<") || text.contains(">"))) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Nhận xét tối đa 1000 ký tự và không chứa ký tự < hoặc >");
        }
        CustomerReview saved = customerReviewRepository.save(CustomerReview.builder()
                .bookingId(bookingId).ownerId(user.getId()).customerId(b.getCustomer().getId())
                .rating(rating).comment(text == null || text.isEmpty() ? null : text)
                .approved(false).build());
        log.info("Chủ xe {} đánh giá khách {} cho đơn {}: {} sao (chờ Admin duyệt)", user.getId(), b.getCustomer().getId(), bookingId, rating);
        return toItem(saved, b, user.getFullName(), b.getCustomer().getFullName());
    }

    /** Chủ xe của đơn / admin / chính khách hàng xem đánh giá khách theo đơn kèm uy tín chung của khách. */
    @Override
    @Transactional(readOnly = true)
    public BookingCustomerReview forBooking(Long bookingId) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + bookingId));
        boolean isOwner = b.getOwner().getId().equals(user.getId());
        boolean isCustomer = b.getCustomer().getId().equals(user.getId());
        boolean isAdmin = currentUserService.isAdmin(user);
        if (!isOwner && !isCustomer && !isAdmin) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền với đơn thuê này");
        }
        CustomerReview raw = customerReviewRepository.findByBookingId(bookingId).orElse(null);
        // Khách thuê chỉ thấy đánh giá khi đã được Admin duyệt; Chủ xe của đơn và Admin thấy cả trạng thái chờ duyệt.
        CustomerReviewItem review = (raw != null && (Boolean.TRUE.equals(raw.getApproved()) || isOwner || isAdmin))
                ? toItem(raw, b, b.getOwner().getFullName(), b.getCustomer().getFullName())
                : null;
        boolean canReview = isOwner && raw == null && b.getStatus() == BookingStatus.COMPLETED;
        return new BookingCustomerReview(review, canReview, summary(b.getCustomer()));
    }

    /** Uy tín của khách: admin, chính khách, hoặc chủ xe từng có đơn với khách này mới xem được. */
    @Override
    @Transactional(readOnly = true)
    public CustomerRatingSummary forCustomer(Long customerId) {
        Customer user = currentUserService.getCurrentUser();
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khách hàng id=" + customerId));
        boolean related = bookingRepository.existsByCustomerIdAndOwnerId(customerId, user.getId());
        if (!user.getId().equals(customerId) && !currentUserService.isAdmin(user) && !related) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem đánh giá của khách này");
        }
        return summary(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerReviewItem> myGivenReviews() {
        Customer user = currentUserService.getCurrentUser();
        return customerReviewRepository.findByOwnerIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(r -> toItem(r, user.getFullName()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CustomerReviewItem> getPagedForAdmin(org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.domain.Page<CustomerReview> page = customerReviewRepository.findAllByOrderByIdDesc(pageable);
        return PageResponse.from(page.map(r -> toItem(r, null)));
    }

    @Override
    @Transactional
    public CustomerReviewItem approveByAdmin(Long id) {
        CustomerReview r = customerReviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá khách hàng id=" + id));
        r.setApproved(true);
        CustomerReview saved = customerReviewRepository.save(r);
        log.info("Admin duyệt đánh giá khách thuê id={} cho đơn bookingId={}", id, r.getBookingId());
        return toItem(saved, null);
    }

    @Override
    @Transactional
    public void deleteByAdmin(Long id) {
        CustomerReview r = customerReviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá khách hàng id=" + id));
        customerReviewRepository.delete(r);
        log.info("Admin gỡ đánh giá khách thuê id={} của đơn bookingId={}", id, r.getBookingId());
    }

    private CustomerRatingSummary summary(Customer customer) {
        List<CustomerReviewItem> items = customerReviewRepository.findByCustomerIdAndApprovedTrueOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(r -> toItem(r, null))
                .toList();
        Double avg = customerReviewRepository.averageRating(customer.getId());
        double rounded = avg == null ? 0.0 : Math.round(avg * 10.0) / 10.0;
        return new CustomerRatingSummary(customer.getId(), customer.getFullName(), rounded, items.size(), items);
    }

    private CustomerReviewItem toItem(CustomerReview r, String knownOwnerName) {
        Booking b = bookingRepository.findById(r.getBookingId()).orElse(null);
        String ownerName = knownOwnerName != null ? knownOwnerName
                : (b != null && b.getOwner() != null ? b.getOwner().getFullName()
                        : customerRepository.findById(r.getOwnerId()).map(Customer::getFullName).orElse(null));
        String customerName = b != null && b.getCustomer() != null ? b.getCustomer().getFullName()
                : customerRepository.findById(r.getCustomerId()).map(Customer::getFullName).orElse(null);
        return toItem(r, b, ownerName, customerName);
    }

    private static CustomerReviewItem toItem(CustomerReview r, Booking b, String ownerName, String customerName) {
        String bookingCode = b != null ? b.getBookingCode() : null;
        String carName = b != null && b.getCar() != null
                ? ((b.getCar().getBrand() != null ? b.getCar().getBrand() + " " : "") + (b.getCar().getModel() != null ? b.getCar().getModel() : "")).trim()
                : null;
        return new CustomerReviewItem(
                r.getId(),
                r.getBookingId(),
                bookingCode,
                carName,
                r.getOwnerId(),
                ownerName,
                r.getCustomerId(),
                customerName,
                r.getRating(),
                r.getComment(),
                Boolean.TRUE.equals(r.getApproved()),
                r.getCreatedAt()
        );
    }
}
