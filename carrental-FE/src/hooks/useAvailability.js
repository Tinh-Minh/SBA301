import { useCallback } from "react";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { slotService } from "@/services/slotService.js";

export function useCarSlots(carId) {
    const load = useCallback(() => slotService.listByCar(carId), [carId]);
    const slots = useApiQuery(["vehicles", "slots", carId], load);
    return slots;
}
