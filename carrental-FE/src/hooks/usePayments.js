import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { rentalService } from "@/services/bookingService.js";
import { transactionService } from "@/services/paymentService.js";

export function usePaymentDetail(orderId) {
    const load = useCallback(async () => {
        const [order, transactions] = await Promise.all([rentalService.getById(orderId), transactionService.listByOrder(orderId)]);
        return { order, transactions };
    }, [orderId]);
    const detail = useApiQuery(["payments", "order", orderId], load);
    return detail;
}
