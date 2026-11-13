package com.carrental.service;

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
public class CustomerReviewService {

    public record CustomerReviewItem(Long id, Long bookingId, Long ownerId, String ownerName,
                                     Integer rating, String comment, LocalDateTime createdAt) {}

    public record CustomerRatingSummary(Long customerId, String customerName, double averageRating,
                                        long totalReviews, List<CustomerReviewItem> reviews) {}

    /** Đánh giá của chủ xe cho một đơn (null nếu chưa có) và uy tín chung của khách. */
    public record BookingCustomerReview(CustomerReviewItem review, boolean canReview, CustomerRatingSummary customer) {}

    private final CustomerReviewRepository customerReviewRepository;
    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final CurrentUserService currentUserService;

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
                .rating(rating).comment(text == null || text.isEmpty() ? null : text).build());
        log.info("Chủ xe {} đánh giá khách {} cho đơn {}: {} sao", user.getId(), b.getCustomer().getId(), bookingId, rating);
        return toItem(saved, user.getFullName());
    }

    /** Chủ xe của đơn / admin / chính khách hàng xem đánh giá khách theo đơn kèm uy tín chung của khách. */
    @Transactional(readOnly = true)
    public BookingCustomerReview forBooking(Long bookingId) {
        Customer user = currentUserService.getCurrentUser();
        Booking b = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + bookingId));
        boolean isOwner = b.getOwner().getId().equals(user.getId());
        boolean isCustomer = b.getCustomer().getId().equals(user.getId());
        if (!isOwner && !isCustomer && !currentUserService.isAdmin(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền với đơn thuê này");
        }
        CustomerReviewItem review = customerReviewRepository.findByBookingId(bookingId)
                .map(r -> toItem(r, b.getOwner().getFullName())).orElse(null);
        boolean canReview = isOwner && review == null && b.getStatus() == BookingStatus.COMPLETED;
        return new BookingCustomerReview(review, canReview, summary(b.getCustomer()));
    }

    /** Uy tín của khách: admin, chính khách, hoặc chủ xe từng có đơn với khách này mới xem được. */
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

    private CustomerRatingSummary summary(Customer customer) {
        List<CustomerReviewItem> items = customerReviewRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(r -> toItem(r, customerRepository.findById(r.getOwnerId()).map(Customer::getFullName).orElse(null)))
                .toList();
        Double avg = customerReviewRepository.averageRating(customer.getId());
        return new CustomerRatingSummary(customer.getId(), customer.getFullName(), avg == null ? 0.0 : avg,
                items.size(), items);
    }

    private static CustomerReviewItem toItem(CustomerReview r, String ownerName) {
        return new CustomerReviewItem(r.getId(), r.getBookingId(), r.getOwnerId(), ownerName, r.getRating(),
                r.getComment(), r.getCreatedAt());
    }
}
