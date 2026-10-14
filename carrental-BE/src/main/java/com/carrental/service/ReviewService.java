package com.carrental.service;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Review;
import com.carrental.exception.AppException;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;

    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        log.info("Tạo đánh giá sau chuyến orderId={}, reviewerId={}, revieweeId={}, rating={}",
                request.getOrderId(), request.getReviewerId(), request.getRevieweeId(), request.getRating());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer reviewer = findCustomerOrThrow(request.getReviewerId());
            Customer reviewee = findCustomerOrThrow(request.getRevieweeId());

            if (reviewRepository.existsByOrderIdAndReviewerId(request.getOrderId(), request.getReviewerId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã gửi đánh giá cho đơn thuê này rồi");
            }

            Review review = request.toEntity();
            review.setOrder(order);
            review.setReviewer(reviewer);
            review.setReviewee(reviewee);

            Review saved = reviewRepository.save(review);
            log.info("Tạo đánh giá thành công id={}", saved.getId());
            return ReviewResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo đánh giá thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo đánh giá orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo đánh giá");
        }
    }

    @Transactional(readOnly = true)
    public ReviewResponse getById(Long id) {
        return ReviewResponse.from(findReviewOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getPaged(Long orderId, Long revieweeId, Pageable pageable) {
        Page<Review> page;
        if (orderId != null) {
            page = reviewRepository.findByOrderId(orderId, pageable);
        } else if (revieweeId != null) {
            page = reviewRepository.findByRevieweeId(revieweeId, pageable);
        } else {
            page = reviewRepository.findAll(pageable);
        }
        return PageResponse.from(page.map(ReviewResponse::from));
    }

    private Review findReviewOrThrow(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
    }

    private RentalOrder findOrderOrThrow(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + orderId));
    }

    private Customer findCustomerOrThrow(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng id=" + customerId));
    }
}
