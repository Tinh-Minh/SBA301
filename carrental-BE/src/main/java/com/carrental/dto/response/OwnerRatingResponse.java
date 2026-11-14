package com.carrental.dto.response;

/** Điểm đánh giá công khai của chủ xe: trung bình sao các đánh giá đã duyệt trên mọi xe của chủ xe. */
public record OwnerRatingResponse(Long ownerId, double averageRating, long reviewCount) {}
