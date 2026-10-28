import { endpoints } from "@/services/endpoints.js";
import { fetchAllPages, request, toPage } from "@/services/api.js";
import { normalizeCar } from "@/utils/apiResponse.js";

export const nullable = (value) => (value === "" || value === undefined ? null : value);

export const numberOrNull = (value) => (value === "" || value === null || value === undefined ? null : Number(value));

/** Trường dùng chung giữa CarCreateRequest và CarUpdateRequest (PUT ghi đè toàn bộ). */
export function carPayload(draft) {
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

export async function getCar(id) {
    return normalizeCar(await request(endpoints.cars.byId(id)));
}

export const carService = {
    /** POST /api/cars — xe mới luôn ở PENDING_APPROVAL; ảnh gửi tiếp qua POST /api/cars/{id}/images. */
    async create(draft) {
        const created = await request(endpoints.cars.list, { method: "POST", json: { licensePlate: draft.licensePlate.trim().toUpperCase(), ...carPayload(draft) } });
        const imageUrls = (draft.imageUrls ?? []).map(url => url.trim()).filter(Boolean);
        if (imageUrls.length)
            await this.addImages(created.id, imageUrls);
        return getCar(created.id);
    },
    /** GET /api/cars/my-cars (tóm tắt) + GET /api/cars/{id} để có đủ địa chỉ, cọc, km... */
    async listMine() {
        const summaries = await fetchAllPages(endpoints.cars.myCars, {}, { pageSize: 50 });
        const details = await Promise.all(summaries.map(summary => getCar(summary.id).catch(() => normalizeCar(summary))));
        return details;
    },
    async listMineSummary(status) {
        return toPage(await request(endpoints.cars.myCars, { query: { status, page: 0, size: 100 } }));
    },
    async getById(id) {
        return getCar(id);
    },
    /** PUT /api/cars/{id} cần gửi đủ trường, nên gộp với dữ liệu hiện tại trước khi gửi. */
    async update(id, changes) {
        const current = await getCar(id);
        const updated = await request(endpoints.cars.byId(id), { method: "PUT", json: carPayload({ ...current, ...changes }) });
        return normalizeCar(updated);
    },
    /** PATCH /api/cars/{id}/status?status=ACTIVE|INACTIVE */
    async setStatus(id, status) {
        return normalizeCar(await request(endpoints.cars.byIdStatus(id), { method: "PATCH", query: { status } }));
    },
    /** POST /api/cars/{id}/images — backend chỉ nhận URL ảnh. */
    async addImages(id, urls, { firstIsPrimary = true } = {}) {
        return request(endpoints.cars.byIdImages(id), {
            method: "POST",
            json: urls.map((imageUrl, index) => ({ imageUrl, isPrimary: firstIsPrimary && index === 0, sortOrder: index })),
        });
    },
    removeImage: (id, imageId) => request(endpoints.cars.byIdImagesById(id, imageId), { method: "DELETE" }),
    setPrimaryImage: (id, imageId) => request(endpoints.cars.byIdImagesByIdPrimary(id, imageId), { method: "PATCH" }),
    /** POST /api/cars/{id}/documents { docType, fileUrl, expiresAt } */
    addDocument: (id, { docType, fileUrl, expiresAt }) => request(endpoints.cars.byIdDocuments(id), { method: "POST", json: { docType, fileUrl, expiresAt: expiresAt || null } }),
    listDocuments: (id) => request(endpoints.cars.byIdDocuments(id)),
    /** GET /api/cars/search — tìm xe đang ACTIVE (không theo lịch trống). */
    async search({ city, carType, brand, seats, page = 0, size = 12, sortBy = "createdAt", direction = "DESC" } = {}) {
        const result = toPage(await request(endpoints.cars.search, { query: { city, carType, brand, seats, page, size, sortBy, direction } }));
        return { ...result, content: result.content.map(normalizeCar) };
    },
    getPublic: getCar,
};
