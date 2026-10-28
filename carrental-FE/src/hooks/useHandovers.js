import { useApiMutation } from "@/hooks/useApiMutation.js";
import { handoverService } from "@/services/handoverService.js";

export function useHandoverActions(onSuccess, orderId) {
    const createHandover = useApiMutation((...args) => orderId === undefined
        ? handoverService.create(...args)
        : handoverService.create(orderId, args[0]), onSuccess);
    const confirmHandover = useApiMutation(handoverService.confirm, onSuccess);
    return { createHandover, confirmHandover };
}
