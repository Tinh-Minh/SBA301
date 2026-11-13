import { request, toPage } from "@/services/api.js";

/** Đơn thuê xe, biên bản bàn giao, hồ sơ an toàn, bảng theo dõi và tải ảnh. */
export const tripService = {
    quote: (carId, pickupAt, returnAt, voucherCode) => request(`/api/cars/${carId}/quote`, { auth: false, query: { pickupAt, returnAt, voucherCode } }),
    availability: (carId) => request(`/api/cars/${carId}/availability`, { auth: false }),
    create: (body) => request("/api/bookings", { method: "POST", json: body }),
    mine: () => request("/api/bookings/my"),
    ownerList: () => request("/api/bookings/owner"),
    get: (id) => request(`/api/bookings/${id}`),
    /** Đánh giá 2 chiều: đánh giá của chủ xe dành cho khách ở đơn này + uy tín chung của khách. */
    customerReview: (id) => request(`/api/bookings/${id}/customer-review`),
    reviewCustomer: (id, rating, comment) => request(`/api/bookings/${id}/customer-review`, { method: "POST", json: { rating: Number(rating), comment: comment?.trim() || null } }),
    /** Khách báo đã trả xe (chốt mốc tính phí trễ). */
    reportReturned: (id) => request(`/api/bookings/${id}/returned`, { method: "POST" }),
    cancel: (id, reason) => request(`/api/bookings/${id}/cancel`, { method: "POST", json: { reason } }),
    payDeposit: (id, method = "VNPAY", bankCode) => request("/api/transactions/booking-deposit", { method: "POST", json: { bookingId: id, method, bankCode } }),
    payRental: (id) => request(`/api/bookings/${id}/rental-payment`, { method: "POST", query: { method: "VNPAY" } }),
    payExtraFee: (id) => request(`/api/bookings/${id}/extra-fee-payment`, { method: "POST", query: { method: "VNPAY" } }),
    customerNoShow: (id) => request(`/api/bookings/${id}/customer-no-show`, { method: "POST" }),
    ownerNoShow: (id) => request(`/api/bookings/${id}/owner-no-show`, { method: "POST" }),
    settlements: (id) => request(`/api/bookings/${id}/settlements`),
    contacted: (id, contactNote) => request(`/api/bookings/${id}/contacted`, { method: "POST", json: { contacted: true, contactNote } }),
    accept: (id) => request(`/api/bookings/${id}/accept`, { method: "POST" }),
    reject: (id, reason) => request(`/api/bookings/${id}/reject`, { method: "POST", json: { reason } }),
    submitHandover: (id, type, { data, photos }) => {
        const form = new FormData();
        form.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (Array.isArray(photos)) {
            for (const p of photos) {
                if (p instanceof File || p instanceof Blob) form.append("photos", p);
            }
        }
        return request(`/api/bookings/${id}/handovers/${type}`, { method: "POST", body: form });
    },
    reviseHandover: (id, type, { data, photos }) => {
        const form = new FormData();
        form.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
        if (Array.isArray(photos)) {
            for (const p of photos) {
                if (p instanceof File || p instanceof Blob) form.append("photos", p);
            }
        }
        return request(`/api/bookings/${id}/handovers/${type}`, { method: "PUT", body: form });
    },
    respondHandover: (id, type, body) => request(`/api/bookings/${id}/handovers/${type}/respond`, { method: "POST", json: body }),
    ownerDashboard: () => request("/api/dashboards/owner"),
    customerDashboard: () => request("/api/dashboards/customer"),
    adminList: async (query) => toPage(await request("/api/admin/bookings", { query })),
    adminStats: () => request("/api/admin/bookings/stats"),
};

export const safetyService = {
    summary: (carId) => request(`/api/cars/${carId}/safety`, { auth: "optional" }),
    create: (carId, body) => request(`/api/cars/${carId}/safety-records`, { method: "POST", json: body }),
    update: (carId, id, body) => request(`/api/cars/${carId}/safety-records/${id}`, { method: "PUT", json: body }),
    uploadFile: (carId, id, file) => {
        const form = new FormData();
        form.append("file", file);
        return request(`/api/cars/${carId}/safety-records/${id}/file`, { method: "POST", body: form });
    },
    remove: (carId, id) => request(`/api/cars/${carId}/safety-records/${id}`, { method: "DELETE" }),
    adminList: async (query) => toPage(await request("/api/admin/safety-records", { query })),
    verify: (carId, id, body) => request(`/api/admin/cars/${carId}/safety-records/${id}/verify`, { method: "PATCH", json: body }),
};

/** POST /api/uploads/images — trả về URL nội bộ của ảnh. */
export async function uploadImage(file) {
    const form = new FormData();
    form.append("file", file);
    const data = await request("/api/uploads/images", { method: "POST", body: form });
    return data.url;
}

/** POST /api/uploads/images/batch — tải nhiều ảnh cùng lúc, trả về danh sách URL nội bộ. */
export async function uploadImages(files) {
    const form = new FormData();
    for (const file of files)
        form.append("files", file);
    const data = await request("/api/uploads/images/batch", { method: "POST", body: form });
    return data.urls ?? [];
}
