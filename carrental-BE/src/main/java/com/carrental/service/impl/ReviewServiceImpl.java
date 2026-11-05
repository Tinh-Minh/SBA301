package com.carrental.service.impl;

import com.carrental.dto.request.CreateReviewRequest;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.ReviewResponse;
import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.entity.Review;
import com.carrental.exception.AppException;
import com.carrental.repository.CarRepository;
import com.carrental.repository.ReviewRepository;
import com.carrental.repository.ReviewSpecification;
import com.carrental.service.CurrentUserService;
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
    private final CarRepository carRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        log.info("Tạo đánh giá cho xe carId={}, rating={}", request.getCarId(), request.getRating());
        try {
            Customer current = currentUserService.getCurrentUser();
            Car car = carRepository.findById(request.getCarId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + request.getCarId()));

            if (car.getOwner() != null && car.getOwner().getId().equals(current.getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chủ xe không thể tự đánh giá xe của mình");
            }

            if (reviewRepository.existsByCarIdAndCustomerId(car.getId(), current.getId())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Bạn đã gửi đánh giá cho xe này rồi");
            }

            Review review = request.toEntity(car, current);
            Review saved = reviewRepository.save(review);
            log.info("Tạo đánh giá thành công id={}", saved.getId());
            return ReviewResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo đánh giá thất bại carId={}: {}", request.getCarId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo đánh giá carId={}", request.getCarId(), e);
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
    public PageResponse<ReviewResponse> getPaged(Long carId, Long customerId, Pageable pageable) {
        Specification<Review> spec = ReviewSpecification.filter(carId, customerId);
        Page<Review> page = reviewRepository.findAll(spec, pageable);
        return PageResponse.from(page.map(ReviewResponse::from));
    }

    private Review findReviewOrThrow(Long id) {
        return reviewRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đánh giá id=" + id));
    }
}
