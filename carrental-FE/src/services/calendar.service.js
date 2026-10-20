import { mockResponse, request, USE_MOCK_API } from "./http";
import { ownerDb } from "./mock/owner-db";
const overlaps = (item, from, to) => Date.parse(item.startTime) < to.getTime() && Date.parse(item.endTime) > from.getTime();
const bookedStatuses = new Set(["CONFIRMED", "ONGOING", "COMPLETED"]);
export const calendarService = {
    /** Khung lịch mở (`car_slots`) và các khoảng đã đặt (`rental_orders`) giao với [from, to). */
    async getRange(from, to) {
        if (USE_MOCK_API)
            return mockResponse({
                cars: ownerDb.cars,
                slots: ownerDb.slots.filter(slot => overlaps(slot, from, to)),
                orders: ownerDb.orders.filter(order => bookedStatuses.has(order.status) && overlaps(order, from, to)),
            });
        const query = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
        return request(`/api/owner/calendar?${query}`);
    },
};
