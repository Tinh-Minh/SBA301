import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { rentalService } from "@/services/bookingService.js";
import { endpoints } from "@/services/endpoints.js";
import { request, toPage } from "@/services/api.js";
import { disputeService } from "@/services/adminService.js";

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
            request(endpoints.orders.byIdLogs(orderId)).catch(() => []),
            request(endpoints.transactions.list, { query: { orderId: orderId, size: 50 } }).then(toPage).then(page => page.content).catch(() => []),
        ]);
        return { logs: Array.isArray(logs) ? logs : [], transactions };
    }, [orderId]);
    const detail = useApiQuery(["admin", "order-detail", orderId], load);
    return detail;
}
