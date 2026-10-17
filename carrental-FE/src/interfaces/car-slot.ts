import type { SlotRentalOption, SlotStatus } from "./enums";

/** Bảng `car_slots` (khung lịch mở cho thuê). */
export interface CarSlot {
  id: number;
  carId: number;
  /** ISO timestamp. */
  startTime: string;
  endTime: string;
  pricePerHour: number;
  pricePerDay: number;
  rentalOption: SlotRentalOption;
  status: SlotStatus;
}
