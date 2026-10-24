"use client";
import { useCallback } from "react";
import { orderService } from "@/services/order.service";
import { useAsyncAction, useAsyncResource } from "@/hooks/useAsyncResource.js";
const loadPending = () => orderService.listMine("PENDING");
export function usePendingRequests() {
    const resource = useAsyncResource(loadPending);
    const approve = useAsyncAction(orderService.approve, resource.reload);
    const rejectOrder = useCallback((id, reason) => orderService.reject(id, reason), []);
    const reject = useAsyncAction(rejectOrder, resource.reload);
    return { ...resource, approve, reject };
}
