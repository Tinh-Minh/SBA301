import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { currentUserId } from "@/utils/session.js";
import { rentalService } from "@/hooks/useBookings.js";
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

export function useOrderReview(orderId) {
    const load = useCallback(async () => {
        const [order, reviews] = await Promise.all([rentalService.getById(orderId), reviewService.listByOrder(orderId)]);
        return { order, mine: reviews.find(review => review.reviewerId === currentUserId()) ?? null };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "review", orderId], load);
    return detail;
}
