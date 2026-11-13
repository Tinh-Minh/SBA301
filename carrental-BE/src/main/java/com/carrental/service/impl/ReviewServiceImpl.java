package com.carrental.service.impl;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewEligibilityResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.entity.Review;
import com.carrental.exception.AppException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.service.CurrentUserService;
import com.carrental.service.ReviewService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final CarRepository carRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        log.info("Tạo đánh giá cho xe carId={}, rating={}", request.getCarId(), request.getRating());

        Customer customer = currentUserService.getCurrentUser();
        Car car = carRepository.findById(request.getCarId())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + request.getCarId()));

        // Xe chưa được duyệt / bị từ chối không hiển thị công khai nên không nhận đánh giá
        if (car.getStatus() != com.carrental.enums.CarStatus.ACTIVE) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + request.getCarId());
        }

        if (car.getOwner() != null && car.getOwner().getId().equals(customer.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn không thể tự đánh giá xe của chính mình");
        }

        // Chỉ người đã hoàn tất chuyến thuê xe này trên CarDB mới được đánh giá
        if (!bookingRepository.existsByCarIdAndCustomerIdAndStatus(car.getId(), customer.getId(),
                com.carrental.enums.BookingStatus.COMPLETED)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ có thể đánh giá xe sau khi hoàn tất chuyến thuê xe này");
        }

        com.carrental.entity.Booking trip = unreviewedTrip(car.getId(), customer.getId());
        if (trip == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã đánh giá tất cả các chuyến thuê xe này");
        }

        Review review = Review.builder()
                .car(car)
                .bookingId(trip.getId())
                .customer(customer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
        if (!Boolean.TRUE.equals(review.getApproved())) {
            boolean canView = currentUserService.optionalCurrentUser()
                    .map(u -> currentUserService.isAdmin(u)
                            || (review.getCustomer() != null && review.getCustomer().getId().equals(u.getId())))
                    .orElse(false);
            if (!canView) {
                throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id);
            }
        }
        return ReviewResponse.from(review);
    }

    @Override
    @Transactional(readOnly = true)
    public CarReviewSummaryResponse getReviewsByCarId(Long carId) {
        if (!carRepository.existsById(carId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId);
        }

        // Chỉ lấy review đã được admin duyệt để hiển thị công khai
        List<Review> reviews = reviewRepository.findByCarIdAndApprovedTrueOrderByCreatedAtDesc(carId);
        Double avg = reviewRepository.getApprovedAverageRatingByCarId(carId);
        if (avg == null) avg = 0.0;
        double roundedAvg = Math.round(avg * 10.0) / 10.0;

        List<ReviewResponse> list = reviews.stream().map(ReviewResponse::from).toList();
        return new CarReviewSummaryResponse(carId, roundedAvg, reviews.size(), list);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getPaged(Long carId, Long customerId, Pageable pageable) {
        boolean includeUnapproved = currentUserService.optionalCurrentUser()
                .map(u -> currentUserService.isAdmin(u) || (customerId != null && customerId.equals(u.getId())))
                .orElse(false);
        Specification<Review> spec = buildFilterSpecification(carId, customerId, includeUnapproved);
        Page<Review> page = reviewRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(ReviewResponse::from));
    }

    @Override
    @Transactional
    public ReviewResponse replyAsOwner(Long id, String reply) {
        Customer user = currentUserService.getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
        if (review.getCar().getOwner() == null || !review.getCar().getOwner().getId().equals(user.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ chủ xe mới được phản hồi đánh giá về xe của mình");
        }
        String text = reply == null ? "" : reply.trim();
        if (text.isEmpty() || text.length() > 1000) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Nội dung phản hồi từ 1 đến 1000 ký tự");
        }
        if (text.contains("<") || text.contains(">")) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Phản hồi không được chứa ký tự < hoặc >");
        }
        review.setOwnerReply(text);
        review.setOwnerRepliedAt(java.time.LocalDateTime.now());
        log.info("Chủ xe {} phản hồi đánh giá id={}", user.getId(), id);
        return ReviewResponse.from(reviewRepository.save(review));
    }

    @Override
    @Transactional
    public ReviewResponse approveByAdmin(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
        review.setApproved(true);
        reviewRepository.save(review);
        log.info("Admin duyệt đánh giá id={} của xe id={}", id, review.getCar().getId());
        return ReviewResponse.from(review);
    }

    @Override
    @Transactional
    public void deleteByAdmin(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
        reviewRepository.delete(review);
        log.info("Admin gỡ đánh giá id={} của xe id={}", id, review.getCar().getId());
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewEligibilityResponse checkEligibility(Long carId) {
        Customer customer;
        try {
            customer = currentUserService.getCurrentUser();
        } catch (Exception e) {
            return new ReviewEligibilityResponse(false, "Vui lòng đăng nhập để đánh giá xe", false, false, false);
        }

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));

        boolean isOwner = car.getOwner() != null && car.getOwner().getId().equals(customer.getId());
        if (isOwner) {
            return new ReviewEligibilityResponse(false, "Bạn không thể tự đánh giá xe của chính mình", false, false, true);
        }

        boolean hasCompletedTrip = bookingRepository.existsByCarIdAndCustomerIdAndStatus(
                car.getId(), customer.getId(), com.carrental.enums.BookingStatus.COMPLETED);
        boolean alreadyReviewed = hasCompletedTrip && unreviewedTrip(car.getId(), customer.getId()) == null;

        if (alreadyReviewed) {
            return new ReviewEligibilityResponse(false, "Bạn đã đánh giá tất cả các chuyến thuê xe này", hasCompletedTrip, true, false);
        }

        if (!hasCompletedTrip) {
            return new ReviewEligibilityResponse(false, "Chỉ khách hàng đã hoàn tất chuyến thuê xe này mới có quyền đánh giá", false, false, false);
        }

        return new ReviewEligibilityResponse(true, null, true, false, false);
    }

    /** Chuyến hoàn tất cũ nhất của khách với xe này mà chưa được đánh giá (mỗi chuyến một đánh giá). */
    private com.carrental.entity.Booking unreviewedTrip(Long carId, Long customerId) {
        return bookingRepository.findAllByCarIdAndCustomerIdAndStatusOrderByCompletedAtAsc(
                        carId, customerId, com.carrental.enums.BookingStatus.COMPLETED).stream()
                .filter(b -> !reviewRepository.existsByBookingId(b.getId()))
                .findFirst().orElse(null);
    }

    private Specification<Review> buildFilterSpecification(Long carId, Long customerId, boolean includeUnapproved) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (carId != null) {
                predicates.add(cb.equal(root.get("car").get("id"), carId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }
            if (!includeUnapproved) {
                predicates.add(cb.isTrue(root.get("approved")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
