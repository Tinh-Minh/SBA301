import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { currentUserId } from "@/utils/session.js";
import { rentalService } from "@/services/bookingService.js";
import { reviewService } from "@/services/reviewService.js";

export function useOwnerReviews(ownerId) {
    const load = useCallback(async () => reviewService.listForUser(ownerId, 20), [ownerId]);
    return useApiQuery(["reviews", "owner", ownerId], load, { enabled: Boolean(ownerId) });
}

export function useOrderReview(orderId) {
    const load = useCallback(async () => {
        const [order, reviews] = await Promise.all([rentalService.getById(orderId), reviewService.listByOrder(orderId)]);
        return { order, mine: reviews.find(review => review.reviewerId === currentUserId()) ?? null };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "review", orderId], load);
    return detail;
}
