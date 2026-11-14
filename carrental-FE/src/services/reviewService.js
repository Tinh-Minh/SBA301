import { endpoints } from "@/services/endpoints.js";
import { request, toPage } from "@/services/api.js";

export const reviewService = {
    /** POST /api/reviews { carId, rating, comment } */
    create: ({ carId, rating, comment }) => request(endpoints.reviews.list, {
        method: "POST",
        json: { carId: Number(carId), rating: Number(rating), comment: comment?.trim() || null },
    }),
    /** GET /api/cars/{carId}/reviews */
    byCar: (carId) => request(`/api/cars/${carId}/reviews`, { auth: false }),
    /** Số sao công khai của chủ xe (không kèm thông tin cá nhân). */
    ownerRating: (ownerId) => request(`/api/reviews/owners/${ownerId}/rating`, { auth: false }),
    /** GET /api/cars/{carId}/reviews/eligibility */
    checkEligibility: (carId) => request(`/api/cars/${carId}/reviews/eligibility`),
    /** POST /api/reviews/{id}/reply { reply } — chủ xe phản hồi đánh giá */
    reply: (id, reply) => request(`/api/reviews/${id}/reply`, { method: "POST", json: { reply: reply?.trim() } }),
    /** GET /api/reviews?customerId= */
    mine: async (customerId) => toPage(await request(endpoints.reviews.list, { query: { customerId, page: 0, size: 50, sort: "id,desc" } })).content,
    /** GET /api/customers/{customerId}/reviews — điểm uy tín và danh sách đánh giá từ chủ xe dành cho khách */
    customerReputation: (customerId) => request(`/api/customers/${customerId}/reviews`),
    /** GET /api/customer-reviews/my-given — danh sách đánh giá khách thuê mà chủ xe đã gửi */
    myGivenCustomerReviews: () => request("/api/customer-reviews/my-given"),
    /** GET /api/admin/customer-reviews — danh sách đánh giá khách thuê cho Admin kiểm duyệt */
    adminCustomerReviews: async (page = 0, size = 20) => toPage(await request("/api/admin/customer-reviews", { query: { page, size, sort: "id,desc" } })),
    /** PATCH /api/admin/customer-reviews/{id}/approve */
    approveCustomerReview: (id) => request(`/api/admin/customer-reviews/${id}/approve`, { method: "PATCH" }),
    /** DELETE /api/admin/customer-reviews/{id} */
    removeCustomerReview: (id) => request(`/api/admin/customer-reviews/${id}`, { method: "DELETE" }),
};
