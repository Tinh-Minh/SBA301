package com.carrental.dto.request;

import com.carrental.entity.Customer;
import com.carrental.entity.RentalOrder;
import com.carrental.entity.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateReviewRequest {
    @NotNull(message = "Mã đơn hàng không được để trống")
    private Long orderId;

    private Long reviewerId;

    @NotNull(message = "Mã người được đánh giá không được để trống")
    private Long revieweeId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    private Integer rating;

    private String comment;

    public Review toEntity() {
        return toEntity(null, null, null);
    }

    public Review toEntity(RentalOrder order, Customer reviewer, Customer reviewee) {
        Review review = new Review();
        review.setOrder(order);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setRating(this.rating);
        review.setComment(this.comment);
        return review;
    }
}
