import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/AuthProvider.jsx";

export function useApiQuery(key, load, { requiresAuth = true, enabled = true } = {}) {
    const { ready, loggedIn, user } = useAuth();
    const query = useQuery({
        queryKey: ["api", user?.id ?? "guest", ...key],
        queryFn: load,
        enabled: ready && enabled && (!requiresAuth || loggedIn),
    });
    const reload = useCallback(() => query.refetch({ cancelRefetch: false }), [query.refetch]);
    return { data: query.data, loading: query.isPending || query.isFetching, error: query.error, reload };
}
