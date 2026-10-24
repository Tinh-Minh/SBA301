import { isHandoverConfirmed, isPayoutReleasable, nextHandoverType } from "@/utils/owner/rules.js";
import { ApiError, mockResponse, request, USE_MOCK_API } from "./http";
import { normalizeHandover } from "./adapters";
import { findOrFail, nextMockId, ownerDb } from "./mock/owner-db";

/** Mô phỏng chuyển trạng thái phía backend sau khi biên bản được hai bên xác nhận. */
function applyMockTransitions(handover) {
    if (!isHandoverConfirmed(handover))
        return;
    const order = findOrFail(ownerDb.orders, handover.orderId, "đơn thuê");
    if (handover.handoverType === "PICKUP") {
        order.status = "ONGOING";
        order.actualStartTime = handover.handedAt;
        return;
    }
    if (!isPayoutReleasable(ownerDb.handovers.filter(item => item.orderId === order.id)))
        return;
    order.status = "COMPLETED";
    order.actualEndTime = handover.handedAt;
    const payout = ownerDb.payouts.find(item => item.orderId === order.id);
    if (payout)
        Object.assign(payout, { status: "PAID", paidAt: new Date().toISOString() });
}

export const handoverService = {
    /** GET /api/orders/{orderId}/handovers */
    async listByOrder(orderId) {
        if (USE_MOCK_API)
            return mockResponse(ownerDb.handovers.filter(item => item.orderId === orderId));
        const list = await request(`/api/orders/${orderId}/handovers`);
        return (Array.isArray(list) ? list : []).map(normalizeHandover);
    },
    /**
     * POST /api/orders/{orderId}/handovers — người lập biên bản (chủ xe hoặc khách) được tự xác nhận,
     * bên còn lại xác nhận qua PUT /api/handovers/{id}/confirm.
     */
    async create(orderId, input) {
        if (USE_MOCK_API) {
            const expected = nextHandoverType(ownerDb.handovers.filter(item => item.orderId === orderId));
            if (input.handoverType !== expected)
                throw new ApiError(409, `Biên bản tiếp theo phải là ${expected ?? "không có"}`);
            const now = new Date().toISOString();
            const handover = { id: nextMockId(), orderId, ...input, handedAt: now, ownerConfirmedAt: now };
            ownerDb.handovers.push(handover);
            return mockResponse(handover);
        }
        return normalizeHandover(await request(`/api/orders/${orderId}/handovers`, {
            method: "POST",
            json: {
                handoverType: input.handoverType,
                odometerKm: Number(input.odometerKm),
                fuelPercent: Number(input.fuelPercent),
                conditionNote: input.conditionNote || null,
                images: (input.images ?? []).filter(image => image?.imageUrl?.trim()),
            },
        }));
    },
    /** PUT /api/handovers/{id}/confirm */
    async confirm(handoverId) {
        if (USE_MOCK_API) {
            const handover = findOrFail(ownerDb.handovers, handoverId, "biên bản");
            handover.ownerConfirmedAt ??= new Date().toISOString();
            applyMockTransitions(handover);
            return mockResponse(handover);
        }
        return normalizeHandover(await request(`/api/handovers/${handoverId}/confirm`, { method: "PUT" }));
    },
    confirmAsOwner(handoverId) {
        return handoverService.confirm(handoverId);
    },
};
