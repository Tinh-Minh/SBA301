import { payoutService } from "@/services/payout.service";
import { useApiQuery } from "@/hooks/useApiQuery.js";
export function useOwnerPayouts() {
    return useApiQuery(["owner", "payouts"], payoutService.getStatement);
}
