import { useCallback } from "react";
import { calendarService } from "@/services/calendar.service";
import { useApiQuery } from "@/hooks/useApiQuery.js";
/** `month` tính từ 0 như `Date#getMonth()`. */
export function useOwnerCalendar(year, month) {
    const load = useCallback(() => calendarService.getRange(new Date(year, month, 1), new Date(year, month + 1, 1)), [year, month]);
    return useApiQuery(["owner", "calendar", year, month], load);
}
