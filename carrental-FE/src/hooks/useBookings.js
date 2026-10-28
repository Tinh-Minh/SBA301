import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { rentalService, rentalGroups } from "@/services/bookingService.js";
import { carService } from "@/services/vehicleService.js";

export function useBookingDetail(orderId) {
    const load = useCallback(async () => {
        const [order, handovers, logs] = await Promise.all([
            rentalService.getById(orderId),
            rentalService.handovers(orderId).catch(() => []),
            rentalService.logs(orderId).catch(() => []),
        ]);
        const car = order?.carId ? await carService.getPublic(order.carId).catch(() => null) : null;
        return { order, handovers, logs: Array.isArray(logs) ? logs : [], car };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "detail", orderId], load);
    return detail;
}

export function useRentals(mode) {
    const load = useCallback(async () => {
        const orders = await rentalService.listMine();
        const allowed = rentalGroups[mode];
        return allowed ? orders.filter(order => allowed.has(order.status)) : orders;
    }, [mode]);
    return useApiQuery(["bookings", "rentals", mode], load);
}
