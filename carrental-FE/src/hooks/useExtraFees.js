import { useCallback } from "react";
import { endpoints } from "@/services/endpoints.js";
import { fetchAllPages, request } from "@/services/api.js";
import { normalizeExtraFee } from "@/utils/apiResponse.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";

export const extraFeeService = {
    /** GET /api/extra-fees?orderId=... */
    async listByOrder(orderId) {
        if (!orderId) return [];
        const fees = await fetchAllPages(endpoints.extraFees.list, { orderId });
        return fees.map(normalizeExtraFee);
    },

    /** GET /api/extra-fees/{id} */
    async getById(id) {
        return normalizeExtraFee(await request(endpoints.extraFees.byId(id)));
    },

    /** POST /api/extra-fees */
    async create({ orderId, feeType, amount, description }) {
        return normalizeExtraFee(
            await request(endpoints.extraFees.list, {
                method: "POST",
                json: {
                    orderId: Number(orderId),
                    feeType,
                    amount: Number(amount),
                    description: description?.trim() || null,
                },
            })
        );
    },

    /** POST /api/extra-fees/{id}/pay { method: "VNPAY" | "CASH" } */
    async pay(id, { method = "VNPAY" } = {}) {
        return normalizeExtraFee(
            await request(endpoints.extraFees.byIdPay(id), {
                method: "POST",
                json: { method },
            })
        );
    },

    /** PUT /api/extra-fees/{id}/waive?note=... */
    async waive(id, note) {
        return normalizeExtraFee(
            await request(endpoints.extraFees.byIdWaive(id), {
                method: "PUT",
                query: note ? { note } : {},
            })
        );
    },
};

export function useOrderExtraFees(orderId) {
    const load = useCallback(() => extraFeeService.listByOrder(orderId), [orderId]);
    return useApiQuery(["orders", orderId, "extra-fees"], load);
}

export function useExtraFeeActions(onSuccess, orderId) {
    const create = useApiMutation((data) => extraFeeService.create({ ...data, orderId }), onSuccess);
    const pay = useApiMutation(({ id, method }) => extraFeeService.pay(id, { method }), onSuccess);
    const waive = useApiMutation(({ id, note }) => extraFeeService.waive(id, note), onSuccess);
    return { create, pay, waive };
}
