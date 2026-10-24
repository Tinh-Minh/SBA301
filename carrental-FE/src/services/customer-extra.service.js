import { toLocalDate } from "@/utils/datetime.js";
import { currentUserId, readSession } from "@/storage/sessionStorage.js";
import { ApiError, request, toPage } from "./http";

/** Thanh toán: /api/transactions */
export const transactionService = {
    /** POST /api/transactions/payment — trả về giao dịch PENDING kèm `paymentUrl` VNPay sandbox. */
    createPayment: ({ orderId, amount, method = "VNPAY" }) => request("/api/transactions/payment", { method: "POST", json: { orderId: Number(orderId), amount: amount ?? null, method } }),
    /** POST /api/transactions/deposit */
    createDeposit: ({ orderId, amount, method = "VNPAY" }) => request("/api/transactions/deposit", { method: "POST", json: { orderId: Number(orderId), amount: amount ?? null, method } }),
    /** POST /api/transactions/{id}/simulate-gateway — giả lập cổng thanh toán (môi trường thử nghiệm). */
    simulate: (id, success = true) => request(`/api/transactions/${id}/simulate-gateway`, { method: "POST", json: { simulateSuccess: success, providerRef: `SIM-${Date.now()}` } }),
    /** GET /api/transactions/{id}/vnpay-url */
    vnpayUrl: (id, bankCode) => request(`/api/transactions/${id}/vnpay-url`, { query: { bankCode } }).then(data => data?.paymentUrl),
    /** GET /api/transactions/vnpay-return?format=json&vnp_... — xác thực chữ ký VNPay trả về. */
    vnpayReturn: (params) => request("/api/transactions/vnpay-return", { query: { ...params, format: "json" } }),
    listByOrder: async (orderId) => toPage(await request("/api/transactions", { query: { orderId, size: 50, sort: "id,desc" } })).content,
};

/** Đánh giá: /api/reviews */
export const reviewService = {
    create: ({ orderId, revieweeId, rating, comment }) => request("/api/reviews", {
        method: "POST",
        json: { orderId: Number(orderId), reviewerId: currentUserId(), revieweeId: Number(revieweeId), rating: Number(rating), comment: comment?.trim() || null },
    }),
    listByOrder: async (orderId) => toPage(await request("/api/reviews", { query: { orderId, size: 20 } })).content,
    listForUser: async (revieweeId, size = 10) => toPage(await request("/api/reviews", { query: { revieweeId, size } })),
};

/** Hồ sơ tài xế: /api/drivers */
export const driverService = {
    /** GET /api/drivers/me — 404 nếu chưa đăng ký. */
    async me() {
        try {
            return await request("/api/drivers/me");
        }
        catch (error) {
            if (error instanceof ApiError && error.status === 404)
                return null;
            throw error;
        }
    },
    eligibility: () => request("/api/drivers/me/eligibility"),
    register: () => request("/api/drivers", { method: "POST" }),
};

/** Giấy tờ định danh: /api/user-documents (multipart). */
export const userDocumentService = {
    listMine: async () => toPage(await request("/api/user-documents", { query: { scope: "mine", size: 50 } })).content,
    get: (id) => request(`/api/user-documents/${id}`),
    submit({ docType, docNumber, fullNameOnDoc, dateOfBirthOnDoc, issuePlace, issueDate, expiresAt, licenseClass, frontImage, backImage }) {
        const form = new FormData();
        form.append("docType", docType);
        form.append("docNumber", docNumber.trim());
        const optional = { fullNameOnDoc, issuePlace, licenseClass: docType === "DRIVER_LICENSE" ? licenseClass : undefined };
        for (const [key, value] of Object.entries(optional))
            if (value?.trim?.())
                form.append(key, value.trim());
        for (const [key, value] of Object.entries({ dateOfBirthOnDoc, issueDate, expiresAt }))
            if (value)
                form.append(key, toLocalDate(value));
        if (frontImage)
            form.append("frontImage", frontImage);
        if (backImage)
            form.append("backImage", backImage);
        return request("/api/user-documents", { method: "POST", body: form });
    },
    async image(id, side) {
        const session = readSession();
        const response = await fetch(`/api/user-documents/${id}/files/${side}`, {
            headers: session ? { Authorization: `Bearer ${session.accessToken}`, "X-User-Id": String(session.account.id) } : {},
        });
        if (!response.ok)
            throw new Error("Không tải được ảnh giấy tờ.");
        return URL.createObjectURL(await response.blob());
    },
};
