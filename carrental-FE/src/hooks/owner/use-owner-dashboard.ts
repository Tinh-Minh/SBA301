"use client";

import { dashboardService } from "@/services/dashboard.service";
import { useAsyncResource } from "../use-async-resource";

export function useOwnerDashboard() {
  return useAsyncResource(dashboardService.getSummary);
}
