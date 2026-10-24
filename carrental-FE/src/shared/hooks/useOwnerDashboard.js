import { dashboardService } from "@/services/dashboard.service.js";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
export function useOwnerDashboard() {
    return useApiQuery(["owner", "dashboard"], dashboardService.getSummary);
}
