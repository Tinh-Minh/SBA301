import { ApiError, jsonBody, mockResponse, request, USE_MOCK_API } from "./http";
import { findOrFail, nextMockId, ownerDb } from "./mock/owner-db";
export const carService = {
    /** Xe mới vào hàng chờ duyệt, chủ xe không tự bật ACTIVE. */
    async create(draft) {
        if (USE_MOCK_API) {
            const plate = draft.licensePlate.trim().toUpperCase();
            if (ownerDb.cars.some(car => car.licensePlate.toUpperCase() === plate))
                throw new ApiError(409, "Biển số này đã có trong đội xe");
            const car = { ...draft, licensePlate: plate, id: nextMockId(), ownerId: ownerDb.owner.id, status: "PENDING_APPROVAL" };
            ownerDb.cars.push(car);
            return mockResponse(car);
        }
        return request("/api/owner/cars", { method: "POST", body: jsonBody(draft) });
    },
    async listMine() {
        if (USE_MOCK_API)
            return mockResponse(ownerDb.cars);
        return request("/api/owner/cars");
    },
    async getById(id) {
        if (USE_MOCK_API)
            return mockResponse(findOrFail(ownerDb.cars, id, "xe"));
        return request(`/api/owner/cars/${id}`);
    },
    async update(id, changes) {
        if (USE_MOCK_API)
            return mockResponse(Object.assign(findOrFail(ownerDb.cars, id, "xe"), changes));
        return request(`/api/owner/cars/${id}`, { method: "PUT", body: jsonBody(changes) });
    },
    /** Chủ xe chỉ bật/tắt giữa ACTIVE và INACTIVE; duyệt/từ chối thuộc về admin. */
    async setStatus(id, status) {
        if (USE_MOCK_API)
            return mockResponse(Object.assign(findOrFail(ownerDb.cars, id, "xe"), { status }));
        return request(`/api/owner/cars/${id}/status`, { method: "PATCH", body: jsonBody({ status }) });
    },
};
