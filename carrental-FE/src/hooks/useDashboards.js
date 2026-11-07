import { useApiQuery } from "@/hooks/useApiQuery.js";
import { dashboardService } from "@/services/dashboardService.js";

export function useOwnerDashboard() {
    return useApiQuery(["owner", "dashboard"], dashboardService.getSummary);
}
