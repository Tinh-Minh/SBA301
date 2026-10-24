import { dashboardService } from "@/services/dashboard.service";
import { useApiQuery } from "@/hooks/useApiQuery.js";
export function useOwnerDashboard() {
    return useApiQuery(["owner", "dashboard"], dashboardService.getSummary);
}
