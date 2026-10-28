import { endpoints } from "@/services/endpoints.js";
import { fetchAllPages } from "@/services/api.js";
import { normalizeOrder } from "@/utils/apiResponse.js";
import { carService } from "@/services/vehicleService.js";
import { slotService } from "@/services/slotService.js";

export const overlaps = (item, from, to) => Date.parse(item.startTime) < to.getTime() && Date.parse(item.endTime) > from.getTime();

export const bookedStatuses = new Set(["CONFIRMED", "ONGOING", "COMPLETED"]);

export const calendarService = {
    /** Khung lịch mở (GET /api/slots/car/{id}) và đơn đã đặt (GET /api/orders/my-cars) giao với [from, to). */
    async getRange(from, to) {
        const cars = await carService.listMine();
        const [slotLists, orders] = await Promise.all([
            Promise.all(cars.map(car => slotService.listByCar(car.id).catch(() => []))),
            fetchAllPages(endpoints.orders.myCars, { sortBy: "startTime", direction: "asc" }),
        ]);
        return {
            cars,
            slots: slotLists.flat().filter(slot => overlaps(slot, from, to)),
            orders: orders.map(normalizeOrder).filter(order => bookedStatuses.has(order.status) && overlaps(order, from, to)),
        };
    },
};
