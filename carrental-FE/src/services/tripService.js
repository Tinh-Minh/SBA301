import { request, toPage } from "@/services/api.js";

/** Đơn thuê xe, biên bản bàn giao, hồ sơ an toàn, bảng theo dõi và tải ảnh. */
export const tripService = {
    quote: (carId, pickupAt, returnAt) => request(`/api/cars/${carId}/quote`, { auth: false, query: { pickupAt, returnAt } }),
    availability: (carId) => request(`/api/cars/${carId}/availability`, { auth: false }),
    create: (body) => request("/api/bookings", { method: "POST", json: body }),
    mine: () => request("/api/bookings/my"),
    ownerList: () => request("/api/bookings/owner"),
    get: (id) => request(`/api/bookings/${id}`),
    cancel: (id, reason) => request(`/api/bookings/${id}/cancel`, { method: "POST", json: { reason } }),
    contacted: (id, contactNote) => request(`/api/bookings/${id}/contacted`, { method: "POST", json: { contacted: true, contactNote } }),
    accept: (id) => request(`/api/bookings/${id}/accept`, { method: "POST" }),
    reject: (id, reason) => request(`/api/bookings/${id}/reject`, { method: "POST", json: { reason } }),
    submitHandover: (id, type, body) => request(`/api/bookings/${id}/handovers/${type}`, { method: "POST", json: body }),
    reviseHandover: (id, type, body) => request(`/api/bookings/${id}/handovers/${type}`, { method: "PUT", json: body }),
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
