import { endpoints } from "@/services/endpoints.js";
import { sumAmounts } from "@/utils/owner.js";
import { currentUserId } from "@/utils/session.js";
import { fetchAllPages, request, toPage } from "@/services/api.js";
import { carFromOrder, normalizeOrder, normalizePayout } from "@/utils/apiResponse.js";
import { bankAccountService } from "@/hooks/useAccount.js";
import { loadCarsById } from "@/hooks/useBookings.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";

/** Ghép payout với đơn thuê và xe để hiển thị sao kê. */
export async function toPayoutRows(payouts) {
    const orders = new Map(await Promise.all([...new Set(payouts.map(item => item.orderId))].map(async id => {
        try {
            return [id, normalizeOrder(await request(endpoints.orders.byId(id)))];
        }
        catch {
            return [id, null];
        }
    })));
    const cars = await loadCarsById([...orders.values()].filter(Boolean).map(order => order.carId));
    return payouts.map(payout => {
        const order = orders.get(payout.orderId) ?? normalizeOrder({ id: payout.orderId, orderCode: payout.orderCode, startTime: payout.createdAt, endTime: payout.createdAt, rentalAmount: payout.grossAmount, commissionRate: 10, quantity: 1 });
        return { payout, order, car: cars.get(order.carId) ?? carFromOrder(order) };
    });
}

export const payoutService = {
    /** Sao kê chủ xe: GET /api/payouts?recipientId={tôi} + tài khoản mặc định. */
    async getStatement() {
        const [payouts, defaultBankAccount] = await Promise.all([
            fetchAllPages(endpoints.payouts.list, { recipientId: currentUserId(), sort: "id,desc" }).then(list => list.map(normalizePayout)),
            bankAccountService.getDefault().catch(() => null),
        ]);
        const rows = await toPayoutRows(payouts);
        return {
            defaultBankAccount,
            rows,
            totals: {
                grossAmount: sumAmounts(payouts, item => item.grossAmount),
                platformFee: sumAmounts(payouts, item => item.platformFee),
                netAmount: sumAmounts(payouts, item => item.netAmount),
            },
        };
    },
};

/** Quản trị payout. */
export const adminPayoutService = {
    async list({ status, recipientId, orderId, page = 0, size = 20 } = {}) {
        const result = toPage(await request(endpoints.payouts.list, { query: { status, recipientId, orderId, page, size, sort: "id,desc" } }));
        return { ...result, content: result.content.map(normalizePayout) };
    },
    listAll: async (query = {}) => (await fetchAllPages(endpoints.payouts.list, { ...query, sort: "id,desc" })).map(normalizePayout),
    /** POST /api/payouts — tạo khoản chi trả cho chủ xe từ đơn đã hoàn thành. */
    create: async ({ orderId, recipientId, bankAccountId, grossAmount, platformFee, netAmount, note }) => normalizePayout(await request(endpoints.payouts.list, {
        method: "POST",
        json: { orderId, recipientId, bankAccountId: bankAccountId ?? null, grossAmount, platformFee, netAmount, note: note || null },
    })),
    /** PUT /api/payouts/{id}/process { status, note } */
    process: async (id, status, note) => normalizePayout(await request(endpoints.payouts.byIdProcess(id), { method: "PUT", json: { status, note: note || null } })),
};

export function useOwnerPayouts() {
    return useApiQuery(["owner", "payouts"], payoutService.getStatement);
}
