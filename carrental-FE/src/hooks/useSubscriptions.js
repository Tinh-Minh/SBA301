import { useCallback } from "react";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { subscriptionService } from "@/services/subscriptionService.js";

export function useMySubscriptions() {
    return useApiQuery(["owner", "subscriptions"], subscriptionService.listMine);
}

export function useListingPackages() {
    return useApiQuery(["subscription", "packages"], subscriptionService.packages);
}

export function useAdminSubscriptions(status, page) {
    const load = useCallback(() => subscriptionService.adminList({ status: status || undefined, page }), [status, page]);
    const resource = useApiQuery(["admin", "subscriptions", status, page], load);
    const cancel = useApiMutation(subscriptionService.cancel, resource.reload);
    return { ...resource, cancel };
}
