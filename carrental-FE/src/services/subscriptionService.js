import { endpoints } from "@/services/endpoints.js";
import { fetchAllPages, request, toPage } from "@/services/api.js";

const body = ({ carId, packageId, voucherCode }) => ({ carId: Number(carId), packageId: Number(packageId), voucherCode: voucherCode?.trim() || undefined });

export const subscriptionService = {
    /** GET /api/subscriptions/packages */
    packages: () => request(endpoints.subscriptions.packages),
    /** POST /api/subscriptions/quote */
    quote: (input) => request(endpoints.subscriptions.quote, { method: "POST", json: body(input) }),
    /** POST /api/subscriptions */
    create: (input) => request(endpoints.subscriptions.list, { method: "POST", json: body(input) }),
    /** GET /api/subscriptions/my-subscriptions */
    listMine: () => fetchAllPages(endpoints.subscriptions.mine, { sortBy: "createdAt", direction: "desc" }, { pageSize: 50 }),
    /** PUT /api/subscriptions/{id}/cancel */
    cancel: (id) => request(endpoints.subscriptions.byIdCancel(id), { method: "PUT" }),
    /** GET /api/admin/subscriptions */
    adminList: async ({ status, page = 0, size = 20 } = {}) => toPage(await request(endpoints.subscriptions.adminList, { query: { status, page, size, sortBy: "createdAt", direction: "desc" } })),
    /** POST /api/transactions/package-payment: tạo giao dịch VNPay rồi chuyển sang trang thanh toán. */
    async payWithVnpay(subscriptionId) {
        const transaction = await request(endpoints.transactions.packagePayment, { method: "POST", json: { subscriptionId, method: "VNPAY" } });
        if (transaction.paymentUrl)
            window.location.assign(transaction.paymentUrl);
        return transaction;
    },
};

export const subscriptionStatusMeta = {
    PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "warning" },
    ACTIVE: { label: "Đang hiển thị", tone: "success" },
    EXPIRED: { label: "Đã hết hạn", tone: "neutral" },
    CANCELLED: { label: "Đã huỷ", tone: "danger" },
};
