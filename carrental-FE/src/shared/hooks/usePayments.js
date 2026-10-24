import { useCallback } from "react";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { rentalService } from "@/shared/hooks/useBookings.js";
import { endpoints } from "@/shared/api/endpoints.js";

import { request, toPage } from "@/shared/api/client.js";

export const transactionService = {
    /** POST /api/transactions/payment — trả về giao dịch PENDING kèm `paymentUrl` VNPay sandbox. */
    createPayment: ({ orderId, amount, method = "VNPAY" }) => request(endpoints.transactions.payment, { method: "POST", json: { orderId: Number(orderId), amount: amount ?? null, method } }),
    /** POST /api/transactions/deposit */
    createDeposit: ({ orderId, amount, method = "VNPAY" }) => request(endpoints.transactions.deposit, { method: "POST", json: { orderId: Number(orderId), amount: amount ?? null, method } }),
    /** POST /api/transactions/{id}/simulate-gateway — giả lập cổng thanh toán (môi trường thử nghiệm). */
    simulate: (id, success = true) => request(endpoints.transactions.byIdSimulateGateway(id), { method: "POST", json: { simulateSuccess: success, providerRef: `SIM-${Date.now()}` } }),
    /** GET /api/transactions/{id}/vnpay-url */
    vnpayUrl: (id, bankCode) => request(endpoints.transactions.byIdVnpayUrl(id), { query: { bankCode } }).then(data => data?.paymentUrl),
    /** GET /api/transactions/vnpay-return?format=json&vnp_... — xác thực chữ ký VNPay trả về. */
    vnpayReturn: (params) => request(endpoints.transactions.vnpayReturn, { query: { ...params, format: "json" } }),
    listByOrder: async (orderId) => toPage(await request(endpoints.transactions.list, { query: { orderId, size: 50, sort: "id,desc" } })).content,
};

export function usePaymentDetail(orderId) {
    const load = useCallback(async () => {
        const [order, transactions] = await Promise.all([rentalService.getById(orderId), transactionService.listByOrder(orderId)]);
        return { order, transactions };
    }, [orderId]);
    const detail = useApiQuery(["payments", "order", orderId], load);
    return detail;
}
