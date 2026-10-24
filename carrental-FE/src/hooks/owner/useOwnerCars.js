"use client";
import { useCallback } from "react";
import { carService } from "@/services/car.service";
import { useAsyncAction, useAsyncResource } from "@/hooks/useAsyncResource.js";
export function useOwnerCars() {
    const resource = useAsyncResource(carService.listMine);
    const toggle = useCallback((car) => carService.setStatus(car.id, car.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"), []);
    const toggleStatus = useAsyncAction(toggle, resource.reload);
    return { ...resource, toggleStatus };
}
export function useOwnerCar(id) {
    const load = useCallback(() => carService.getById(id), [id]);
    const resource = useAsyncResource(load, String(id));
    const update = useCallback((changes) => carService.update(id, changes), [id]);
    const save = useAsyncAction(update, resource.reload);
    return { ...resource, save };
}
