import { useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/shared/hooks/useAuth.js";

export function useApiMutation(action, onSuccess) {
    const client = useQueryClient();
    const { user } = useAuth();
    const mutation = useMutation({
        mutationFn: async args => {
            try { return await action(...args); }
            catch (error) { throw error instanceof Error ? error : new Error(String(error)); }
        },
        onSuccess: async result => {
            const queryKey = ["api", user?.id ?? "guest"];
            // Mark dependent screens stale; existing reload callbacks can refresh first.
            await client.invalidateQueries({ queryKey, refetchType: "none" });
            await onSuccess?.(result);
            await client.refetchQueries({ queryKey, type: "active", stale: true }, { cancelRefetch: false });
        },
    });
    const run = useCallback(async (...args) => {
        try { return await mutation.mutateAsync(args); }
        catch { return undefined; }
    }, [mutation.mutateAsync]);
    return { run, running: mutation.isPending, error: mutation.error };
}
