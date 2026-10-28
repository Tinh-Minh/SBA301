import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { endpoints } from "@/shared/api/endpoints.js";
import { toLocalIso } from "@/utils/datetime.js";
import { fetchAllPages, request, toPage } from "@/shared/api/client.js";
import { carFromOrder, normalizeCar, normalizeHandover, normalizeOrder, renterFromOrder } from "@/utils/apiResponse.js";

const reasonBody = (reason) => (reason ? { reason } : {});

/** Tải chi tiết xe (có cache theo lần gọi) để ghép vào đơn. */
export async function loadCarsById(carIds) {
    const unique = [...new Set(carIds.filter(Boolean))];
    const entries = await Promise.all(unique.map(async id => {
        try {
            return [id, normalizeCar(await request(endpoints.cars.byId(id)))];
        }
        catch {
            return [id, null];
        }
    }));
    return new Map(entries);
}

export async function loadHandovers(orderId) {
    const list = await request(endpoints.orders.byIdHandovers(orderId));
    return (Array.isArray(list) ? list : []).map(normalizeHandover);
}

/** Dạng `{ order, car, renter, handovers }` các màn chủ xe đang dùng. */
export async function toOwnerViews(orders, { withHandovers = false } = {}) {
    const normalized = orders.map(normalizeOrder);
    const cars = await loadCarsById(normalized.map(order => order.carId));
    const needsHandover = new Set(["CONFIRMED", "ONGOING", "COMPLETED"]);
    return Promise.all(normalized.map(async order => ({
        order,
        car: cars.get(order.carId) ?? carFromOrder(order),
        renter: renterFromOrder(order),
        handovers: withHandovers && needsHandover.has(order.status) ? await loadHandovers(order.id).catch(() => []) : [],
    })));
}

export const orderService = {
    /** Chủ xe: GET /api/orders/my-cars */
    async listMine(status) {
        const orders = await fetchAllPages(endpoints.orders.myCars, { status, sortBy: "createdAt", direction: "desc" });
        return toOwnerViews(orders, { withHandovers: status !== "PENDING" });
    },
    async getById(id) {
        const [view] = await toOwnerViews([await request(endpoints.orders.byId(id))], { withHandovers: true });
        return view;
    },
    /** PUT /api/orders/{id}/confirm */
    async approve(id) {
        return normalizeOrder(await request(endpoints.orders.byIdConfirm(id), { method: "PUT", json: {} }));
    },
    /** PUT /api/orders/{id}/reject { reason } */
    async reject(id, reason) {
        return normalizeOrder(await request(endpoints.orders.byIdReject(id), { method: "PUT", json: reasonBody(reason) }));
    },
};

/** Luồng khách thuê. */
export const rentalService = {
    /** POST /api/orders/quote */
    quote: ({ carSlotId, rentalType, startTime, endTime, voucherCode }) => request(endpoints.orders.quote, {
        method: "POST",
        json: { carSlotId: Number(carSlotId), rentalType, startTime: toLocalIso(startTime), endTime: toLocalIso(endTime), voucherCode: voucherCode?.trim() || null },
    }),
    /** POST /api/orders */
    create: async ({ carSlotId, rentalType, startTime, endTime, voucherCode, note }) => normalizeOrder(await request(endpoints.orders.list, {
        method: "POST",
        json: { carSlotId: Number(carSlotId), rentalType, startTime: toLocalIso(startTime), endTime: toLocalIso(endTime), voucherCode: voucherCode?.trim() || null, note: note?.trim() || null },
    })),
    /** GET /api/orders/my-rentals */
    async listMine(status) {
        return (await fetchAllPages(endpoints.orders.myRentals, { status, sortBy: "createdAt", direction: "desc" })).map(normalizeOrder);
    },
    getById: async (id) => normalizeOrder(await request(endpoints.orders.byId(id))),
    /** PUT /api/orders/{id}/cancel { reason } */
    cancel: async (id, reason) => normalizeOrder(await request(endpoints.orders.byIdCancel(id), { method: "PUT", json: reasonBody(reason) })),
    /** GET /api/orders/{id}/logs */
    logs: (id) => request(endpoints.orders.byIdLogs(id)),
    handovers: loadHandovers,
};

/** Quản trị: GET /api/orders */
export const adminOrderService = {
    async list({ status, page = 0, size = 20 } = {}) {
        const result = toPage(await request(endpoints.orders.list, { query: { status, page, size, sortBy: "createdAt", direction: "desc" } }));
        return { ...result, content: result.content.map(normalizeOrder) };
    },
    async listAll(status) {
        return (await fetchAllPages(endpoints.orders.list, { status, sortBy: "createdAt", direction: "desc" })).map(normalizeOrder);
    },
};

export function useBookingDetail(orderId) {
    const load = useCallback(async () => {
        const [order, handovers, logs] = await Promise.all([
            rentalService.getById(orderId),
            rentalService.handovers(orderId).catch(() => []),
            rentalService.logs(orderId).catch(() => []),
        ]);
        return { order, handovers, logs: Array.isArray(logs) ? logs : [] };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "detail", orderId], load);
    return detail;
}

const rentalGroups = {
    active: new Set(["PENDING", "CONFIRMED", "ONGOING"]),
    history: new Set(["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"]),
};

export function useRentals(mode) {
    const load = useCallback(async () => {
        const orders = await rentalService.listMine();
        const allowed = rentalGroups[mode];
        return allowed ? orders.filter(order => allowed.has(order.status)) : orders;
    }, [mode]);
    return useApiQuery(["bookings", "rentals", mode], load);
}
