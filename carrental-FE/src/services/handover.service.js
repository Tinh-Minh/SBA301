import { request } from "./http";
import { normalizeHandover } from "./adapters";

export const handoverService = {
    /** GET /api/orders/{orderId}/handovers */
    async listByOrder(orderId) {
        const list = await request(`/api/orders/${orderId}/handovers`);
        return (Array.isArray(list) ? list : []).map(normalizeHandover);
    },
    /**
     * POST /api/orders/{orderId}/handovers — người lập biên bản (chủ xe hoặc khách) được tự xác nhận,
     * bên còn lại xác nhận qua PUT /api/handovers/{id}/confirm.
     */
    async create(orderId, input) {
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
        return normalizeHandover(await request(`/api/handovers/${handoverId}/confirm`, { method: "PUT" }));
    },
    confirmAsOwner(handoverId) {
        return handoverService.confirm(handoverId);
    },
};
