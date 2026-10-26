package com.carrental.service.impl;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Review;
import com.carrental.enums.OrderStatus;
import com.carrental.exception.AppException;
import com.carrental.util.OrderAccess;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.ReviewSpecification;
import com.carrental.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;
    private final OrderAccess orderAccess;

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        log.info("Tạo đánh giá sau chuyến orderId={}, reviewerId={}, revieweeId={}, rating={}",
                request.getOrderId(), request.getReviewerId(), request.getRevieweeId(), request.getRating());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer current = orderAccess.requireUser();
            if (order.getStatus() != OrderStatus.COMPLETED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ đánh giá được đơn đã hoàn thành (COMPLETED)");
            }
            Customer reviewer = current;
            boolean renter = orderAccess.isRenter(order, reviewer);
            boolean owner = orderAccess.isOwner(order, reviewer);
            if (!renter && !owner) {
                throw new AppException(HttpStatus.FORBIDDEN, "Chỉ người thuê hoặc chủ xe của đơn này mới được đánh giá");
            }
            Long otherPartyId;
            if (renter) {
                if (order.getCar() == null || order.getCar().getOwner() == null) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Đơn thuê chưa gắn chủ xe để đánh giá");
                }
                otherPartyId = order.getCar().getOwner().getId();
            } else {
                otherPartyId = order.getCustomer().getId();
            }
            if (otherPartyId.equals(reviewer.getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể tự đánh giá chính mình");
            }
            if (request.getRevieweeId() == null || !request.getRevieweeId().equals(otherPartyId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Người được đánh giá phải là bên còn lại của đơn");
            }
            Customer reviewee = findCustomerOrThrow(otherPartyId);

            if (reviewRepository.existsByOrderIdAndReviewerId(request.getOrderId(), reviewer.getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã gửi đánh giá cho đơn thuê này rồi");
            }

            Review review = request.toEntity(order, reviewer, reviewee);
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

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getById(Long id) {
        return ReviewResponse.from(findReviewOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getPaged(Long orderId, Long revieweeId, Pageable pageable) {
        Specification<Review> spec = ReviewSpecification.filter(orderId, revieweeId);
        Page<Review> page = reviewRepository.findAll(spec, pageable);
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
