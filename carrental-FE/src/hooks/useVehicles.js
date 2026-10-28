import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { carService, getOwnerCounts } from "@/services/vehicleService.js";

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

/** Số xe và số yêu cầu chờ duyệt của chủ xe. */
export function useOwnerCounts() {
    const { data } = useApiQuery(["owner", "counts"], getOwnerCounts);
    return data ?? { cars: null, pending: null };
}
