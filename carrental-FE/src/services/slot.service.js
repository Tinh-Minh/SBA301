import { toLocalIso } from "@/utils/datetime.js";
import { fetchAllPages, request, toPage } from "./http";
import { normalizeSlot } from "./adapters";

export const slotService = {
    /** GET /api/slots/search — các khung giờ OPEN mà khách có thể đặt. */
    async search({ city, carType, seats, maxPricePerHour, maxPricePerDay, rentalType, startTime, endTime, page = 0, size = 12 } = {}) {
        const result = toPage(await request("/api/slots/search", {
            query: {
                city,
                carType,
                seats,
                maxPricePerHour,
                maxPricePerDay,
                rentalType,
                startTime: startTime ? toLocalIso(startTime) : undefined,
                endTime: endTime ? toLocalIso(endTime) : undefined,
                page,
                size,
            },
        }));
        return { ...result, content: result.content.map(normalizeSlot) };
    },
    /** GET /api/slots/{id} */
    getById: async (id) => normalizeSlot(await request(`/api/slots/${id}`)),
    /** GET /api/slots/car/{carId} (chủ xe) */
    listByCar: async (carId) => (await fetchAllPages(`/api/slots/car/${carId}`, {}, { pageSize: 100 })).map(normalizeSlot),
    /** POST /api/slots */
    create: async ({ carId, startTime, endTime, rentalOption, minRentalHours, customPricePerHour, customPricePerDay }) => normalizeSlot(await request("/api/slots", {
        method: "POST",
        json: {
            carId,
            startTime: toLocalIso(startTime),
            endTime: toLocalIso(endTime),
            rentalOption,
            minRentalHours: minRentalHours ? Number(minRentalHours) : null,
            customPricePerHour: customPricePerHour ? Number(customPricePerHour) : null,
            customPricePerDay: customPricePerDay ? Number(customPricePerDay) : null,
        },
    })),
    close: async (id) => normalizeSlot(await request(`/api/slots/${id}/close`, { method: "PATCH" })),
    cancel: async (id) => normalizeSlot(await request(`/api/slots/${id}/cancel`, { method: "PATCH" })),
    reopen: async (id) => normalizeSlot(await request(`/api/slots/${id}/reopen`, { method: "PATCH" })),
};
