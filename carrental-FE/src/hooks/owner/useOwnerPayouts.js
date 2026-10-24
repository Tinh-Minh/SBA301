"use client";
import { payoutService } from "@/services/payout.service";
import { useAsyncResource } from "@/hooks/useAsyncResource.js";
export function useOwnerPayouts() {
    return useAsyncResource(payoutService.getStatement);
}
