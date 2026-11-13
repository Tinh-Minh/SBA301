import { endpoints } from "@/services/endpoints.js";
import { request, toPage } from "@/services/api.js";

export const transactionService = {
    /** GET /api/transactions/{id}/vnpay-url */
    vnpayUrl: (id, bankCode) => request(endpoints.transactions.byIdVnpayUrl(id), { query: { bankCode } }).then(data => data?.paymentUrl),
    /** GET /api/transactions/vnpay-return?format=json&vnp_... — xác thực chữ ký VNPay trả về. */
    vnpayReturn: (params) => request(endpoints.transactions.vnpayReturn, { query: { ...params, format: "json" } }),
    /** GET /api/transactions — danh sách giao dịch có phân trang (admin). */
    listPage: async (query) => toPage(await request(endpoints.transactions.list, { query })),
    /** GET /api/transactions — giao dịch gói đăng tin của người đang đăng nhập. */
    listRecent: async () => toPage(await request(endpoints.transactions.list, { query: { page: 0, size: 50, sort: "id,desc" } })).content,
};
