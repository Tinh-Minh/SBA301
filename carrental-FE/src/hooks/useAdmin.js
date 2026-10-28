import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { adminOrderService, rentalService } from "@/hooks/useBookings.js";
import { endpoints } from "@/shared/api/endpoints.js";
import { toLocalIso } from "@/utils/datetime.js";
import { toNumber } from "@/utils/labels.js";
import { currentUserId } from "@/utils/session.js";
import { fetchAllPages, request, toPage } from "@/shared/api/client.js";
import { normalizeCar, normalizeOrder } from "@/utils/apiResponse.js";
import { getCustomer, getCustomerKyc, listCustomers, updateCustomerStatus } from "@/hooks/useAccount.js";
import { adminPayoutService } from "@/hooks/usePayouts.js";

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
        pageOf(endpoints.userDocuments.list, { scope: "all", customerId, verifyStatus, docType, page, size, sort: "createdAt,desc" }),
    getDocument: (id) => request(endpoints.userDocuments.byId(id)),
    /** PATCH /api/user-documents/{id}/review { verifyStatus: APPROVED|REJECTED, rejectReason } */
    reviewDocument: (id, verifyStatus, rejectReason) => request(endpoints.userDocuments.byIdReview(id), {
        method: "PATCH",
        json: { verifyStatus, rejectReason: verifyStatus === "REJECTED" ? (rejectReason || null) : null },
    }),
    /** URL ảnh giấy tờ (cần JWT nên tải qua Axios rồi tạo blob URL). */
    async documentImage(id, side) {
        const blob = await request(endpoints.userDocuments.byIdFilesById(id, side), { responseType: "blob" });
        return URL.createObjectURL(blob);
    },
};

/** Thẩm định xe (ADMIN): /api/admin/cars */
export const adminCarService = {
    list: ({ status, page = 0, size = 20 } = {}) => pageOf(endpoints.adminCars.list, { status, page, size, sortBy: "createdAt", direction: "DESC" }, normalizeCar),
    getDetail: async (id) => normalizeCar(await request(endpoints.cars.byId(id))),
    documents: (id) => request(endpoints.cars.byIdDocuments(id)).then(list => (Array.isArray(list) ? list : [])),
    approve: async (id) => normalizeCar(await request(endpoints.adminCars.byIdApprove(id), { method: "POST" })),
    reject: async (id, reason) => normalizeCar(await request(endpoints.adminCars.byIdReject(id), { method: "POST", json: { reason } })),
    /** PATCH /api/admin/cars/{id}/documents/{docId}/verify { verifyStatus, rejectReason } */
    verifyDocument: (carId, docId, verifyStatus, rejectReason) => request(endpoints.adminCars.byIdDocumentsByIdVerify(carId, docId), {
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
    list: ({ code, status, window, page = 0, size = 50 } = {}) => pageOf(endpoints.vouchers.list, { code, status, window, page, size, sort: "createdAt,desc" }, normalizeVoucher),
    /** POST /api/vouchers — backend từ chối trường lạ, số tiền phải là number. */
    create: async ({ code, description, discountType, discountValue, maxDiscount, minOrderAmount, startAt, endAt, usageLimit, perUserLimit }) => normalizeVoucher(await request(endpoints.vouchers.list, {
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
    update: async (id, { description, usageLimit }) => normalizeVoucher(await request(endpoints.vouchers.byId(id), {
        method: "PUT",
        json: { description: description?.trim() || null, usageLimit: usageLimit === "" || usageLimit === null || usageLimit === undefined ? null : Math.trunc(Number(usageLimit)) },
    })),
    /** PATCH /api/vouchers/{id}/status { status: ACTIVE|INACTIVE } */
    setStatus: async (id, status) => normalizeVoucher(await request(endpoints.vouchers.byIdStatus(id), { method: "PATCH", json: { status } })),
};

/** Khiếu nại: /api/disputes */
export const disputeService = {
    list: ({ status, orderId, raisedById, page = 0, size = 50 } = {}) => pageOf(endpoints.disputes.list, { status, orderId, raisedById, page, size, sort: "id,desc" }),
    get: (id) => request(endpoints.disputes.byId(id)),
    /** POST /api/disputes */
    create: ({ orderId, reason, description, evidences = [] }) => request(endpoints.disputes.list, {
        method: "POST",
        json: { orderId: Number(orderId), raisedById: currentUserId(), reason, description: description || null, evidences },
    }),
    /** POST /api/disputes/{id}/evidences */
    addEvidence: (id, { fileUrl, fileType, description }) => request(endpoints.disputes.byIdEvidences(id), { method: "POST", json: { uploadedById: currentUserId(), fileUrl, fileType, description: description || null } }),
    /** PUT /api/disputes/{id}/resolve { status: IN_REVIEW|RESOLVED|REJECTED, resolutionNote, resolvedById, approvedAmount } */
    resolve: (id, status, resolutionNote, approvedAmount) => request(endpoints.disputes.byIdResolve(id), {
        method: "PUT",
        json: { status, resolutionNote: resolutionNote || null, resolvedById: currentUserId(), approvedAmount: approvedAmount ? Number(approvedAmount) : null },
    }),
};

export { adminOrderService, adminPayoutService };

/** Tổng quan quản trị ghép từ các API danh sách (backend chưa có endpoint thống kê riêng). */
export async function getAdminOverview() {
    const safe = (promise, fallback) => promise.catch(() => fallback);
    const emptyPage = { content: [], totalElements: 0 };
    const [orders, customers, pendingKyc, pendingCars, pendingDocs, openDisputes, pendingPayouts] = await Promise.all([
        safe(fetchAllPages(endpoints.orders.list, { sortBy: "createdAt", direction: "desc" }).then(list => list.map(normalizeOrder)), []),
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

export function useOrderDisputes(orderId) {
    const load = useCallback(async () => {
        const [order, disputes] = await Promise.all([
            rentalService.getById(orderId),
            disputeService.list({ orderId, size: 20 }).then(page => page.content).catch(() => []),
        ]);
        return { order, disputes };
    }, [orderId]);
    const detail = useApiQuery(["bookings", "dispute", orderId], load);
    return detail;
}

export function useAdminOrderDetail(orderId) {
    const load = useCallback(async () => {
        const [logs, transactions] = await Promise.all([
            request(endpoints.orders.byIdLogs(orderId)).catch(() => []),
            request(endpoints.transactions.list, { query: { orderId: orderId, size: 50 } }).then(toPage).then(page => page.content).catch(() => []),
        ]);
        return { logs: Array.isArray(logs) ? logs : [], transactions };
    }, [orderId]);
    const detail = useApiQuery(["admin", "order-detail", orderId], load);
    return detail;
}
