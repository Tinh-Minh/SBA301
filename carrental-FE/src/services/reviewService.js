import { currentUserId } from "@/utils/session.js";
import { endpoints } from "@/services/endpoints.js";
import { request, toPage } from "@/services/api.js";

export const reviewService = {
    create: ({ orderId, revieweeId, rating, comment }) => request(endpoints.reviews.list, {
        method: "POST",
        json: { orderId: Number(orderId), reviewerId: currentUserId(), revieweeId: Number(revieweeId), rating: Number(rating), comment: comment?.trim() || null },
    }),
    listByOrder: async (orderId) => toPage(await request(endpoints.reviews.list, { query: { orderId, size: 20 } })).content,
    listForUser: async (revieweeId, size = 10) => toPage(await request(endpoints.reviews.list, { query: { revieweeId, size } })),
};
