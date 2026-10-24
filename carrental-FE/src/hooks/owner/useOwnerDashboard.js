"use client";
import { dashboardService } from "@/services/dashboard.service";
import { useAsyncResource } from "@/hooks/useAsyncResource.js";
export function useOwnerDashboard() {
    return useAsyncResource(dashboardService.getSummary);
}
