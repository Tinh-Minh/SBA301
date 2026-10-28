import { endpoints } from "@/services/endpoints.js";
import { request, toPage } from "@/services/api.js";
import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { carService } from "@/services/vehicleService.js";

export function useOwnerCars() {
    const resource = useApiQuery(["owner", "vehicles"], carService.listMine);
    const toggle = useCallback((car) => carService.setStatus(car.id, car.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"), []);
    const toggleStatus = useApiMutation(toggle, resource.reload);
    return { ...resource, toggleStatus };
}

export function useOwnerCar(id) {
    const load = useCallback(() => carService.getById(id), [id]);
    const resource = useApiQuery(["owner", "vehicle", String(id)], load);
    const update = useCallback((changes) => carService.update(id, changes), [id]);
    const save = useApiMutation(update, resource.reload);
    return { ...resource, save };
}

/** Đếm số xe (GET /api/cars/my-cars) và yêu cầu chờ duyệt (GET /api/orders/my-cars?status=PENDING). */
export function useOwnerCounts() {
    const { data } = useApiQuery(["owner", "counts"], async () => {
        const [cars, pending] = await Promise.all([
            request(endpoints.cars.myCars, { query: { page: 0, size: 1 } }).then(toPage).catch(() => null),
            request(endpoints.orders.myCars, { query: { status: "PENDING", page: 0, size: 1 } }).then(toPage).catch(() => null),
        ]);
        return { cars: cars?.totalElements ?? null, pending: pending?.totalElements ?? null };
    });
    return data ?? { cars: null, pending: null };
}
