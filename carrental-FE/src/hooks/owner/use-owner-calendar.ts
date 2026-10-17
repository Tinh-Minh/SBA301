"use client";

import { useCallback } from "react";
import { calendarService } from "@/services/calendar.service";
import { useAsyncResource } from "../use-async-resource";

/** `month` tính từ 0 như `Date#getMonth()`. */
export function useOwnerCalendar(year: number, month: number) {
  const load = useCallback(() => calendarService.getRange(new Date(year, month, 1), new Date(year, month + 1, 1)), [year, month]);
  return useAsyncResource(load, `${year}-${month}`);
}
