import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { rentalService } from "@/services/bookingService.js";
import { adminOrderDetailService, disputeService } from "@/services/adminService.js";

export function useOrderDisputes(orderId) {
    const load = useCallback(async () => {
        const [order, disputes] = await Promise.all([
            rentalService.getById(orderId),
            disputeService.list({ orderId, size: 20 }).then(page => page.content).catch(() => []),
        ]);
        return { order, disputes };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "dispute", orderId], load);
    return detail;
}

export function useAdminOrderDetail(orderId) {
    const load = useCallback(async () => {
        const [logs, transactions] = await Promise.all([
            adminOrderDetailService.logs(orderId),
            adminOrderDetailService.transactions(orderId),
        ]);
        return { logs: Array.isArray(logs) ? logs : [], transactions };
    }, [orderId]);
    const detail = useApiQuery(["admin", "order-detail", orderId], load);
    return detail;
}
