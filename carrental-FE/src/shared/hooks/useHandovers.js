import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { endpoints } from "@/shared/api/endpoints.js";
import { request } from "@/shared/api/client.js";
import { normalizeHandover } from "@/shared/utils/apiResponse.js";

export const handoverService = {
    /** GET /api/orders/{orderId}/handovers */
    async listByOrder(orderId) {
        const list = await request(endpoints.orders.byIdHandovers(orderId));
        return (Array.isArray(list) ? list : []).map(normalizeHandover);
    },
    /**
     * POST /api/orders/{orderId}/handovers — người lập biên bản (chủ xe hoặc khách) được tự xác nhận,
     * bên còn lại xác nhận qua PUT /api/handovers/{id}/confirm.
     */
    async create(orderId, input) {
        return normalizeHandover(await request(endpoints.orders.byIdHandovers(orderId), {
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
        return normalizeHandover(await request(endpoints.handovers.byIdConfirm(handoverId), { method: "PUT" }));
    },
    confirmAsOwner(handoverId) {
        return handoverService.confirm(handoverId);
    },
};

export function useHandoverActions(onSuccess, orderId) {
    const createHandover = useApiMutation((...args) => orderId === undefined
        ? handoverService.create(...args)
        : handoverService.create(orderId, args[0]), onSuccess);
    const confirmHandover = useApiMutation(handoverService.confirm, onSuccess);
    return { createHandover, confirmHandover };
}
