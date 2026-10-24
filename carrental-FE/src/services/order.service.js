import { canRespondToOrder, isOrderExpired } from "@/utils/owner/rules.js";
import { toLocalIso } from "@/utils/datetime.js";
import { ApiError, fetchAllPages, mockResponse, request, toPage, USE_MOCK_API } from "./http";
import { carFromOrder, normalizeCar, normalizeHandover, normalizeOrder, renterFromOrder } from "./adapters";
import { findOrFail, ownerDb, toOrderView } from "./mock/owner-db";

function expireStaleMockOrders() {
    for (const order of ownerDb.orders)
        if (isOrderExpired(order))
            order.status = "EXPIRED";
}
function respond(id, status) {
    expireStaleMockOrders();
    const order = findOrFail(ownerDb.orders, id, "đơn thuê");
    if (!canRespondToOrder(order))
        throw new ApiError(409, `Đơn ${order.orderCode} không còn chờ phản hồi`);
    order.status = status;
    return mockResponse(toOrderView(order));
}

const reasonBody = (reason) => (reason ? { reason } : {});

/** Tải chi tiết xe (có cache theo lần gọi) để ghép vào đơn. */
export async function loadCarsById(carIds) {
    const unique = [...new Set(carIds.filter(Boolean))];
    const entries = await Promise.all(unique.map(async id => {
        try {
            return [id, normalizeCar(await request(`/api/cars/${id}`))];
        }
        catch {
            return [id, null];
        }
    }));
    return new Map(entries);
}

export async function loadHandovers(orderId) {
    const list = await request(`/api/orders/${orderId}/handovers`);
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
        if (USE_MOCK_API) {
            expireStaleMockOrders();
            return mockResponse(ownerDb.orders.filter(order => !status || order.status === status).map(toOrderView));
        }
        const orders = await fetchAllPages("/api/orders/my-cars", { status, sortBy: "createdAt", direction: "desc" });
        return toOwnerViews(orders, { withHandovers: status !== "PENDING" });
    },
    async getById(id) {
        if (USE_MOCK_API)
            return mockResponse(toOrderView(findOrFail(ownerDb.orders, id, "đơn thuê")));
        const [view] = await toOwnerViews([await request(`/api/orders/${id}`)], { withHandovers: true });
        return view;
    },
    /** PUT /api/orders/{id}/confirm */
    async approve(id) {
        if (USE_MOCK_API)
            return respond(id, "CONFIRMED");
        return normalizeOrder(await request(`/api/orders/${id}/confirm`, { method: "PUT", json: {} }));
    },
    /** PUT /api/orders/{id}/reject { reason } */
    async reject(id, reason) {
        if (USE_MOCK_API)
            return respond(id, "REJECTED");
        return normalizeOrder(await request(`/api/orders/${id}/reject`, { method: "PUT", json: reasonBody(reason) }));
    },
};

/** Luồng khách thuê. */
export const rentalService = {
    /** POST /api/orders/quote */
    quote: ({ carSlotId, rentalType, startTime, endTime, voucherCode }) => request("/api/orders/quote", {
        method: "POST",
        json: { carSlotId: Number(carSlotId), rentalType, startTime: toLocalIso(startTime), endTime: toLocalIso(endTime), voucherCode: voucherCode?.trim() || null },
    }),
    /** POST /api/orders */
    create: async ({ carSlotId, rentalType, startTime, endTime, voucherCode, note }) => normalizeOrder(await request("/api/orders", {
        method: "POST",
        json: { carSlotId: Number(carSlotId), rentalType, startTime: toLocalIso(startTime), endTime: toLocalIso(endTime), voucherCode: voucherCode?.trim() || null, note: note?.trim() || null },
    })),
    /** GET /api/orders/my-rentals */
    async listMine(status) {
        return (await fetchAllPages("/api/orders/my-rentals", { status, sortBy: "createdAt", direction: "desc" })).map(normalizeOrder);
    },
    getById: async (id) => normalizeOrder(await request(`/api/orders/${id}`)),
    /** PUT /api/orders/{id}/cancel { reason } */
    cancel: async (id, reason) => normalizeOrder(await request(`/api/orders/${id}/cancel`, { method: "PUT", json: reasonBody(reason) })),
    /** GET /api/orders/{id}/logs */
    logs: (id) => request(`/api/orders/${id}/logs`),
    handovers: loadHandovers,
};

/** Quản trị: GET /api/orders */
export const adminOrderService = {
    async list({ status, page = 0, size = 20 } = {}) {
        const result = toPage(await request("/api/orders", { query: { status, page, size, sortBy: "createdAt", direction: "desc" } }));
        return { ...result, content: result.content.map(normalizeOrder) };
    },
    async listAll(status) {
        return (await fetchAllPages("/api/orders", { status, sortBy: "createdAt", direction: "desc" })).map(normalizeOrder);
    },
};
