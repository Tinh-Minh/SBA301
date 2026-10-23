import { ApiError, fetchAllPages, mockResponse, request, toPage, USE_MOCK_API } from "./http";
import { normalizeCar } from "./adapters";
import { findOrFail, nextMockId, ownerDb } from "./mock/owner-db";

const nullable = (value) => (value === "" || value === undefined ? null : value);
const numberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

/** Trường dùng chung giữa CarCreateRequest và CarUpdateRequest (PUT ghi đè toàn bộ). */
function carPayload(draft) {
    return {
        brand: draft.brand?.trim(),
        model: draft.model?.trim(),
        manufactureYear: Number(draft.manufactureYear),
        carType: draft.carType,
        seats: Number(draft.seats),
        transmission: draft.transmission,
        fuelType: draft.fuelType,
        color: nullable(draft.color?.trim?.() ?? draft.color),
        description: nullable(draft.description?.trim?.() ?? draft.description),
        features: draft.features ? (typeof draft.features === "string" ? draft.features : JSON.stringify(draft.features)) : "[]",
        city: draft.city?.trim(),
        district: nullable(draft.district?.trim?.() ?? draft.district),
        pickupAddress: draft.pickupAddress?.trim(),
        latitude: numberOrNull(draft.latitude),
        longitude: numberOrNull(draft.longitude),
        pricePerHour: Number(draft.pricePerHour),
        pricePerDay: Number(draft.pricePerDay),
        depositAmount: numberOrNull(draft.depositAmount),
        kmLimitPerDay: numberOrNull(draft.kmLimitPerDay),
        extraKmFee: numberOrNull(draft.extraKmFee),
    };
}

async function getCar(id) {
    return normalizeCar(await request(`/api/cars/${id}`));
}

export const carService = {
    /** POST /api/cars — xe mới luôn ở PENDING_APPROVAL; ảnh gửi tiếp qua POST /api/cars/{id}/images. */
    async create(draft) {
        if (USE_MOCK_API) {
            const plate = draft.licensePlate.trim().toUpperCase();
            if (ownerDb.cars.some(car => car.licensePlate.toUpperCase() === plate))
                throw new ApiError(409, "Biển số này đã có trong đội xe");
            const car = { ...draft, licensePlate: plate, id: nextMockId(), ownerId: ownerDb.owner.id, status: "PENDING_APPROVAL" };
            ownerDb.cars.push(car);
            return mockResponse(car);
        }
        const created = await request("/api/cars", { method: "POST", json: { licensePlate: draft.licensePlate.trim().toUpperCase(), ...carPayload(draft) } });
        const imageUrls = (draft.imageUrls ?? []).map(url => url.trim()).filter(Boolean);
        if (imageUrls.length)
            await this.addImages(created.id, imageUrls);
        return getCar(created.id);
    },
    /** GET /api/cars/my-cars (tóm tắt) + GET /api/cars/{id} để có đủ địa chỉ, cọc, km... */
    async listMine() {
        if (USE_MOCK_API)
            return mockResponse(ownerDb.cars);
        const summaries = await fetchAllPages("/api/cars/my-cars", {}, { pageSize: 50 });
        const details = await Promise.all(summaries.map(summary => getCar(summary.id).catch(() => normalizeCar(summary))));
        return details;
    },
    async listMineSummary(status) {
        return toPage(await request("/api/cars/my-cars", { query: { status, page: 0, size: 100 } }));
    },
    async getById(id) {
        if (USE_MOCK_API)
            return mockResponse(findOrFail(ownerDb.cars, id, "xe"));
        return getCar(id);
    },
    /** PUT /api/cars/{id} cần gửi đủ trường, nên gộp với dữ liệu hiện tại trước khi gửi. */
    async update(id, changes) {
        if (USE_MOCK_API)
            return mockResponse(Object.assign(findOrFail(ownerDb.cars, id, "xe"), changes));
        const current = await getCar(id);
        const updated = await request(`/api/cars/${id}`, { method: "PUT", json: carPayload({ ...current, ...changes }) });
        return normalizeCar(updated);
    },
    /** PATCH /api/cars/{id}/status?status=ACTIVE|INACTIVE */
    async setStatus(id, status) {
        if (USE_MOCK_API)
            return mockResponse(Object.assign(findOrFail(ownerDb.cars, id, "xe"), { status }));
        return normalizeCar(await request(`/api/cars/${id}/status`, { method: "PATCH", query: { status } }));
    },
    /** POST /api/cars/{id}/images — backend chỉ nhận URL ảnh. */
    async addImages(id, urls, { firstIsPrimary = true } = {}) {
        return request(`/api/cars/${id}/images`, {
            method: "POST",
            json: urls.map((imageUrl, index) => ({ imageUrl, isPrimary: firstIsPrimary && index === 0, sortOrder: index })),
        });
    },
    removeImage: (id, imageId) => request(`/api/cars/${id}/images/${imageId}`, { method: "DELETE" }),
    setPrimaryImage: (id, imageId) => request(`/api/cars/${id}/images/${imageId}/primary`, { method: "PATCH" }),
    /** POST /api/cars/{id}/documents { docType, fileUrl, expiresAt } */
    addDocument: (id, { docType, fileUrl, expiresAt }) => request(`/api/cars/${id}/documents`, { method: "POST", json: { docType, fileUrl, expiresAt: expiresAt || null } }),
    listDocuments: (id) => request(`/api/cars/${id}/documents`),
    /** GET /api/cars/search — tìm xe đang ACTIVE (không theo lịch trống). */
    async search({ city, carType, brand, seats, page = 0, size = 12, sortBy = "createdAt", direction = "DESC" } = {}) {
        const result = toPage(await request("/api/cars/search", { query: { city, carType, brand, seats, page, size, sortBy, direction } }));
        return { ...result, content: result.content.map(normalizeCar) };
    },
    getPublic: getCar,
};
