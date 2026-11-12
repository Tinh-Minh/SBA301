package com.carrental.service.impl;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.CarReviewSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.entity.Review;
import com.carrental.exception.AppException;
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

        if (reviewRepository.existsByCarIdAndCustomerId(car.getId(), customer.getId())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã gửi đánh giá cho chiếc xe này rồi");
        }

        Review review = Review.builder()
                .car(car)
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
        return ReviewResponse.from(review);
    }

    @Override
    @Transactional(readOnly = true)
    public CarReviewSummaryResponse getReviewsByCarId(Long carId) {
        if (!carRepository.existsById(carId)) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId);
        }

        List<Review> reviews = reviewRepository.findByCarIdOrderByCreatedAtDesc(carId);
        Double avg = reviewRepository.getAverageRatingByCarId(carId);
        if (avg == null) avg = 0.0;
        double roundedAvg = Math.round(avg * 10.0) / 10.0;

        List<ReviewResponse> list = reviews.stream().map(ReviewResponse::from).toList();
        return new CarReviewSummaryResponse(carId, roundedAvg, reviews.size(), list);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> getPaged(Long carId, Long customerId, Pageable pageable) {
        Specification<Review> spec = buildFilterSpecification(carId, customerId);
        Page<Review> page = reviewRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(ReviewResponse::from));
    }

    @Override
    @Transactional
    public void deleteByAdmin(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
        reviewRepository.delete(review);
        log.info("Admin gỡ đánh giá id={} của xe id={}", id, review.getCar().getId());
    }

    private Specification<Review> buildFilterSpecification(Long carId, Long customerId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (carId != null) {
                predicates.add(cb.equal(root.get("car").get("id"), carId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
