"use client";

import { payoutService } from "@/services/payout.service";
import { useAsyncResource } from "../use-async-resource";

export function useOwnerPayouts() {
  return useAsyncResource(payoutService.getStatement);
}
