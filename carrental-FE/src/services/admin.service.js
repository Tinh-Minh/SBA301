import { toLocalIso } from "@/utils/datetime.js";
import { toNumber } from "@/utils/labels.js";
import { currentUserId } from "@/storage/sessionStorage.js";
import { fetchAllPages, request, toPage } from "./http";
import { normalizeCar, normalizeOrder } from "./adapters";
import { listCustomers, getCustomer, getCustomerKyc, updateCustomerStatus } from "./customer.service";
import { adminOrderService } from "./order.service";
import { adminPayoutService } from "./payout.service";

const pageOf = async (path, query, map = (item) => item) => {
    const result = toPage(await request(path, { query }));
    return { ...result, content: result.content.map(map) };
};

/** Người dùng & giấy tờ KYC (ADMIN). */
export const adminUserService = {
    list: listCustomers,
    get: getCustomer,
    kyc: getCustomerKyc,
    /** PATCH /api/customers/{id}/status { status: ACTIVE|LOCKED, reason } */
    setStatus: updateCustomerStatus,
    /** GET /api/user-documents?scope=all&customerId&verifyStatus */
    listDocuments: ({ customerId, verifyStatus, docType, page = 0, size = 50 } = {}) =>
        pageOf("/api/user-documents", { scope: "all", customerId, verifyStatus, docType, page, size, sort: "createdAt,desc" }),
    getDocument: (id) => request(`/api/user-documents/${id}`),
    /** PATCH /api/user-documents/{id}/review { verifyStatus: APPROVED|REJECTED, rejectReason } */
    reviewDocument: (id, verifyStatus, rejectReason) => request(`/api/user-documents/${id}/review`, {
        method: "PATCH",
        json: { verifyStatus, rejectReason: verifyStatus === "REJECTED" ? (rejectReason || null) : null },
    }),
    /** URL ảnh giấy tờ (cần JWT nên tải qua Axios rồi tạo blob URL). */
    async documentImage(id, side) {
        const blob = await request(`/api/user-documents/${id}/files/${side}`, { responseType: "blob" });
        return URL.createObjectURL(blob);
    },
};

/** Thẩm định xe (ADMIN): /api/admin/cars */
export const adminCarService = {
    list: ({ status, page = 0, size = 20 } = {}) => pageOf("/api/admin/cars", { status, page, size, sortBy: "createdAt", direction: "DESC" }, normalizeCar),
    getDetail: async (id) => normalizeCar(await request(`/api/cars/${id}`)),
    documents: (id) => request(`/api/cars/${id}/documents`).then(list => (Array.isArray(list) ? list : [])),
    approve: async (id) => normalizeCar(await request(`/api/admin/cars/${id}/approve`, { method: "POST" })),
    reject: async (id, reason) => normalizeCar(await request(`/api/admin/cars/${id}/reject`, { method: "POST", json: { reason } })),
    /** PATCH /api/admin/cars/{id}/documents/{docId}/verify { verifyStatus, rejectReason } */
    verifyDocument: (carId, docId, verifyStatus, rejectReason) => request(`/api/admin/cars/${carId}/documents/${docId}/verify`, {
        method: "PATCH",
        json: { verifyStatus, rejectReason: rejectReason || null },
    }),
};

const normalizeVoucher = (voucher) => ({
    ...voucher,
    discountValue: toNumber(voucher.discountValue),
    maxDiscount: voucher.maxDiscount === null || voucher.maxDiscount === undefined ? null : toNumber(voucher.maxDiscount),
    minOrderAmount: toNumber(voucher.minOrderAmount),
});

/** Voucher (ADMIN): /api/vouchers */
export const adminVoucherService = {
    list: ({ code, status, window, page = 0, size = 50 } = {}) => pageOf("/api/vouchers", { code, status, window, page, size, sort: "createdAt,desc" }, normalizeVoucher),
    /** POST /api/vouchers — backend từ chối trường lạ, số tiền phải là number. */
    create: async ({ code, description, discountType, discountValue, maxDiscount, minOrderAmount, startAt, endAt, usageLimit, perUserLimit }) => normalizeVoucher(await request("/api/vouchers", {
        method: "POST",
        json: {
            code: code.trim().toUpperCase(),
            description: description?.trim() || null,
            discountType,
            discountValue: Number(discountValue),
            maxDiscount: maxDiscount === "" || maxDiscount === null || maxDiscount === undefined ? null : Number(maxDiscount),
            minOrderAmount: Number(minOrderAmount || 0),
            startAt: toLocalIso(startAt),
            endAt: toLocalIso(endAt),
            usageLimit: usageLimit === "" || usageLimit === null || usageLimit === undefined ? null : Math.trunc(Number(usageLimit)),
            perUserLimit: Math.trunc(Number(perUserLimit || 1)),
        },
    })),
    /** PUT /api/vouchers/{id} { description, usageLimit } */
    update: async (id, { description, usageLimit }) => normalizeVoucher(await request(`/api/vouchers/${id}`, {
        method: "PUT",
        json: { description: description?.trim() || null, usageLimit: usageLimit === "" || usageLimit === null || usageLimit === undefined ? null : Math.trunc(Number(usageLimit)) },
    })),
    /** PATCH /api/vouchers/{id}/status { status: ACTIVE|INACTIVE } */
    setStatus: async (id, status) => normalizeVoucher(await request(`/api/vouchers/${id}/status`, { method: "PATCH", json: { status } })),
};

/** Khiếu nại: /api/disputes */
export const disputeService = {
    list: ({ status, orderId, raisedById, page = 0, size = 50 } = {}) => pageOf("/api/disputes", { status, orderId, raisedById, page, size, sort: "id,desc" }),
    get: (id) => request(`/api/disputes/${id}`),
    /** POST /api/disputes */
    create: ({ orderId, reason, description, evidences = [] }) => request("/api/disputes", {
        method: "POST",
        json: { orderId: Number(orderId), raisedById: currentUserId(), reason, description: description || null, evidences },
    }),
    /** POST /api/disputes/{id}/evidences */
    addEvidence: (id, { fileUrl, fileType, description }) => request(`/api/disputes/${id}/evidences`, { method: "POST", json: { uploadedById: currentUserId(), fileUrl, fileType, description: description || null } }),
    /** PUT /api/disputes/{id}/resolve { status: IN_REVIEW|RESOLVED|REJECTED, resolutionNote, resolvedById } */
    resolve: (id, status, resolutionNote) => request(`/api/disputes/${id}/resolve`, {
        method: "PUT",
        json: { status, resolutionNote: resolutionNote || null, resolvedById: currentUserId() },
    }),
};

export { adminOrderService, adminPayoutService };

/** Tổng quan quản trị ghép từ các API danh sách (backend chưa có endpoint thống kê riêng). */
export async function getAdminOverview() {
    const safe = (promise, fallback) => promise.catch(() => fallback);
    const emptyPage = { content: [], totalElements: 0 };
    const [orders, customers, pendingKyc, pendingCars, pendingDocs, openDisputes, pendingPayouts] = await Promise.all([
        safe(fetchAllPages("/api/orders", { sortBy: "createdAt", direction: "desc" }).then(list => list.map(normalizeOrder)), []),
        safe(listCustomers({ size: 1 }), emptyPage),
        safe(listCustomers({ kycStatus: "PENDING", size: 5 }), emptyPage),
        safe(adminCarService.list({ status: "PENDING_APPROVAL", size: 5 }), emptyPage),
        safe(adminUserService.listDocuments({ verifyStatus: "PENDING", size: 5 }), emptyPage),
        safe(disputeService.list({ status: "OPEN", size: 1 }), emptyPage),
        safe(adminPayoutService.list({ status: "PENDING", size: 1 }), emptyPage),
    ]);
    const now = new Date();
    const thisMonth = orders.filter(order => {
        const created = new Date(order.createdAt);
        return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    });
    const revenueOrders = orders.filter(order => ["CONFIRMED", "ONGOING", "COMPLETED"].includes(order.status));
    const gmv = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const platformFee = revenueOrders.reduce((sum, order) => sum + Math.round(order.rentalAmount * order.commissionRate / 100), 0);
    return {
        totals: {
            gmv,
            platformFee,
            orders: orders.length,
            ordersThisMonth: thisMonth.length,
            ongoing: orders.filter(order => order.status === "ONGOING").length,
            customers: customers.totalElements,
            pendingKyc: pendingKyc.totalElements,
            pendingCars: pendingCars.totalElements,
            pendingDocs: pendingDocs.totalElements,
            openDisputes: openDisputes.totalElements,
            pendingPayouts: pendingPayouts.totalElements,
        },
        pendingKyc: pendingKyc.content,
        pendingCars: pendingCars.content,
        latestOrders: orders.slice(0, 5),
    };
}

/** Badge sidebar quản trị. */
export async function getAdminBadges() {
    const count = (promise) => promise.then(page => page.totalElements).catch(() => 0);
    const [kyc, cars, disputes, payouts] = await Promise.all([
        count(adminUserService.listDocuments({ verifyStatus: "PENDING", size: 1 })),
        count(adminCarService.list({ status: "PENDING_APPROVAL", size: 1 })),
        count(disputeService.list({ status: "OPEN", size: 1 })),
        count(adminPayoutService.list({ status: "PENDING", size: 1 })),
    ]);
    return { kyc, cars, disputes, payouts };
}
