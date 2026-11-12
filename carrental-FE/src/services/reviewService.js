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
    /** GET /api/cars/{carId}/reviews/eligibility */
    checkEligibility: (carId) => request(`/api/cars/${carId}/reviews/eligibility`),
    /** GET /api/reviews?customerId= */
    mine: async (customerId) => toPage(await request(endpoints.reviews.list, { query: { customerId, page: 0, size: 50, sort: "id,desc" } })).content,
};
