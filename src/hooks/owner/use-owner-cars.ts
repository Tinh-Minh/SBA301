"use client";

import { useCallback } from "react";
import type { Car } from "@/interfaces";
import { carService, type CarUpdate } from "@/services/car.service";
import { useAsyncAction, useAsyncResource } from "../use-async-resource";

export function useOwnerCars() {
  const resource = useAsyncResource(carService.listMine);
  const toggle = useCallback((car: Car) => carService.setStatus(car.id, car.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"), []);
  const toggleStatus = useAsyncAction(toggle, resource.reload);
  return { ...resource, toggleStatus };
}

export function useOwnerCar(id: number) {
  const load = useCallback(() => carService.getById(id), [id]);
  const resource = useAsyncResource(load, String(id));
  const update = useCallback((changes: CarUpdate) => carService.update(id, changes), [id]);
  const save = useAsyncAction(update, resource.reload);
  return { ...resource, save };
}
