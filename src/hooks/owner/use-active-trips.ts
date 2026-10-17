"use client";

import { useCallback } from "react";
import { handoverService, type HandoverInput } from "@/services/handover.service";
import { orderService } from "@/services/order.service";
import { useAsyncAction, useAsyncResource } from "../use-async-resource";

const loadTrips = () => orderService.listMine("ONGOING");

export function useActiveTrips() {
  const resource = useAsyncResource(loadTrips);
  const create = useCallback((orderId: number, input: HandoverInput) => handoverService.create(orderId, input), []);
  const createHandover = useAsyncAction(create, resource.reload);
  const confirmHandover = useAsyncAction(handoverService.confirmAsOwner, resource.reload);
  return { ...resource, createHandover, confirmHandover };
}
