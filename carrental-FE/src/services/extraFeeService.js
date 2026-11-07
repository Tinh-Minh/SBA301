import { endpoints } from "@/services/endpoints.js";
import { fetchAllPages, request } from "@/services/api.js";
import { normalizeExtraFee } from "@/utils/apiResponse.js";

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
