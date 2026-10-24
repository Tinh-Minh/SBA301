"use client";
import { useCallback } from "react";
import { calendarService } from "@/services/calendar.service";
import { useAsyncResource } from "@/hooks/useAsyncResource.js";
/** `month` tính từ 0 như `Date#getMonth()`. */
export function useOwnerCalendar(year, month) {
    const load = useCallback(() => calendarService.getRange(new Date(year, month, 1), new Date(year, month + 1, 1)), [year, month]);
    return useAsyncResource(load, `${year}-${month}`);
}
