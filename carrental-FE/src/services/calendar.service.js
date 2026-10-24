import { fetchAllPages } from "./http";
import { normalizeOrder } from "./adapters";
import { carService } from "./car.service";
import { slotService } from "./slot.service";

const overlaps = (item, from, to) => Date.parse(item.startTime) < to.getTime() && Date.parse(item.endTime) > from.getTime();
const bookedStatuses = new Set(["CONFIRMED", "ONGOING", "COMPLETED"]);

export const calendarService = {
    /** Khung lịch mở (GET /api/slots/car/{id}) và đơn đã đặt (GET /api/orders/my-cars) giao với [from, to). */
    async getRange(from, to) {
        const cars = await carService.listMine();
        const [slotLists, orders] = await Promise.all([
            Promise.all(cars.map(car => slotService.listByCar(car.id).catch(() => []))),
            fetchAllPages("/api/orders/my-cars", { sortBy: "startTime", direction: "asc" }),
        ]);
        return {
            cars,
            slots: slotLists.flat().filter(slot => overlaps(slot, from, to)),
            orders: orders.map(normalizeOrder).filter(order => bookedStatuses.has(order.status) && overlaps(order, from, to)),
        };
    },
};
