import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { extraFeeService } from "@/services/extraFeeService.js";

export function useOrderExtraFees(orderId) {
    const load = useCallback(() => extraFeeService.listByOrder(orderId), [orderId]);
    return useApiQuery(["orders", orderId, "extra-fees"], load);
}

export function useExtraFeeActions(onSuccess, orderId) {
    const create = useApiMutation((data) => extraFeeService.create({ ...data, orderId }), onSuccess);
    const pay = useApiMutation(({ id, method }) => extraFeeService.pay(id, { method }), onSuccess);
    const waive = useApiMutation(({ id, note }) => extraFeeService.waive(id, note), onSuccess);
    return { create, pay, waive };
}
