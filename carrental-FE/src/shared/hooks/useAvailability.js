import { useCallback } from "react";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { endpoints } from "@/shared/api/endpoints.js";
import { toLocalIso } from "@/shared/utils/datetime.js";
import { fetchAllPages, request, toPage } from "@/shared/api/client.js";
import { normalizeSlot } from "@/shared/utils/apiResponse.js";

export const slotService = {
    /** GET /api/slots/search — các khung giờ OPEN mà khách có thể đặt. */
    async search({ city, carType, seats, maxPricePerHour, maxPricePerDay, rentalType, startTime, endTime, page = 0, size = 12 } = {}) {
        const result = toPage(await request(endpoints.slots.search, {
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
    getById: async (id) => normalizeSlot(await request(endpoints.slots.byId(id))),
    /** GET /api/slots/car/{carId} (chủ xe) */
    listByCar: async (carId) => (await fetchAllPages(endpoints.slots.carById(carId), {}, { pageSize: 100 })).map(normalizeSlot),
    /** POST /api/slots */
    create: async ({ carId, startTime, endTime, rentalOption, minRentalHours, customPricePerHour, customPricePerDay }) => normalizeSlot(await request(endpoints.slots.list, {
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
    close: async (id) => normalizeSlot(await request(endpoints.slots.byIdClose(id), { method: "PATCH" })),
    cancel: async (id) => normalizeSlot(await request(endpoints.slots.byIdCancel(id), { method: "PATCH" })),
    reopen: async (id) => normalizeSlot(await request(endpoints.slots.byIdReopen(id), { method: "PATCH" })),
};

export function useCarSlots(carId) {
    const load = useCallback(() => slotService.listByCar(carId), [carId]);
    const slots = useApiQuery(["vehicles", "slots", carId], load);
    return slots;
}
