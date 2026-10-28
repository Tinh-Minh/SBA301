import { useApiQuery } from "@/hooks/useApiQuery.js";
import { payoutService } from "@/services/payoutService.js";

export function useOwnerPayouts() {
    return useApiQuery(["owner", "payouts"], payoutService.getStatement);
}
