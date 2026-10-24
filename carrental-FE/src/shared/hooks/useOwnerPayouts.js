import { payoutService } from "@/services/payout.service.js";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
export function useOwnerPayouts() {
    return useApiQuery(["owner", "payouts"], payoutService.getStatement);
}
