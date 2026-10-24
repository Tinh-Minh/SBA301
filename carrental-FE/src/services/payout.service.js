import { sumAmounts } from "@/utils/owner/finance.js";
import { currentUserId } from "@/storage/sessionStorage.js";
import { fetchAllPages, mockResponse, request, toPage, USE_MOCK_API } from "./http";
import { carFromOrder, normalizeOrder, normalizePayout } from "./adapters";
import { bankAccountService } from "./bank-account.service";
import { loadCarsById } from "./order.service";
import { ownerDb, toPayoutView } from "./mock/owner-db";

/** Ghép payout với đơn thuê và xe để hiển thị sao kê. */
export async function toPayoutRows(payouts) {
    const orders = new Map(await Promise.all([...new Set(payouts.map(item => item.orderId))].map(async id => {
        try {
            return [id, normalizeOrder(await request(`/api/orders/${id}`))];
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
        if (USE_MOCK_API) {
            const rows = ownerDb.payouts.map(toPayoutView).sort((a, b) => Date.parse(b.order.startTime) - Date.parse(a.order.startTime));
            const payouts = rows.map(row => row.payout);
            return mockResponse({
                defaultBankAccount: ownerDb.bankAccounts.find(account => account.isDefault),
                rows,
                totals: {
                    grossAmount: sumAmounts(payouts, item => item.grossAmount),
                    platformFee: sumAmounts(payouts, item => item.platformFee),
                    netAmount: sumAmounts(payouts, item => item.netAmount),
                },
            });
        }
        const [payouts, defaultBankAccount] = await Promise.all([
            fetchAllPages("/api/payouts", { recipientId: currentUserId(), sort: "id,desc" }).then(list => list.map(normalizePayout)),
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
        const result = toPage(await request("/api/payouts", { query: { status, recipientId, orderId, page, size, sort: "id,desc" } }));
        return { ...result, content: result.content.map(normalizePayout) };
    },
    listAll: async (query = {}) => (await fetchAllPages("/api/payouts", { ...query, sort: "id,desc" })).map(normalizePayout),
    /** POST /api/payouts — tạo khoản chi trả cho chủ xe từ đơn đã hoàn thành. */
    create: async ({ orderId, recipientId, bankAccountId, grossAmount, platformFee, netAmount, note }) => normalizePayout(await request("/api/payouts", {
        method: "POST",
        json: { orderId, recipientId, bankAccountId: bankAccountId ?? null, grossAmount, platformFee, netAmount, note: note || null },
    })),
    /** PUT /api/payouts/{id}/process { status, note } */
    process: async (id, status, note) => normalizePayout(await request(`/api/payouts/${id}/process`, { method: "PUT", json: { status, note: note || null } })),
};
