import { sumAmounts } from "@/lib/owner/finance";
import { mockResponse, request, USE_MOCK_API } from "./http";
import { ownerDb, toPayoutView } from "./mock/owner-db";
export const payoutService = {
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
        return request("/api/owner/payouts");
    },
};
