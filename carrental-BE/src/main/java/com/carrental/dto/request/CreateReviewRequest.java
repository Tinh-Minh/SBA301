package com.carrental.dto.request;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.entity.Review;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {

    @NotNull(message = "carId không được để trống")
    private Long carId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao tối thiểu là 1")
    @Max(value = 5, message = "Số sao tối đa là 5")
    @tools.jackson.databind.annotation.JsonDeserialize(using = StrictIntegerDeserializer.class)
    private Integer rating;

    @Size(max = 2000, message = "Nội dung nhận xét tối đa 2000 ký tự")
    private String comment;

    public Review toEntity(Car car, Customer customer) {
        Review review = new Review();
        review.setCar(car);
        review.setCustomer(customer);
        review.setRating(this.rating);
        review.setComment(this.comment);
        return review;
    }
}
