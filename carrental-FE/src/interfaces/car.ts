import type { DateTimeString } from "./api";
import type { RentalType } from "./order";

/** Function 2: xe và khung giờ cho thuê (CarController, CarSlotController). */

export type CarStatus = "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE" | "REJECTED";
export type SlotStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type RentalOption = RentalType | "BOTH";

export interface CarSummaryResponse {
  id: number;
  licensePlate: string;
  brand: string;
  model: string;
  carType: string;
  seats: number;
  transmission: string;
  fuelType: string;
  city: string;
  pricePerHour: number;
  pricePerDay: number;
  status: CarStatus;
}

export interface CarResponse extends CarSummaryResponse {
  ownerId: number;
  ownerFullName: string;
  driverId: number | null;
  manufactureYear: number;
  color: string | null;
  description: string | null;
  features: string | null;
  district: string | null;
  pickupAddress: string;
  latitude: number | null;
  longitude: number | null;
  depositAmount: number;
  kmLimitPerDay: number | null;
  extraKmFee: number | null;
  images: unknown[];
  documents: unknown[];
  createdAt: DateTimeString;
}

export interface CarSlotResponse {
  id: number;
  carId: number;
  licensePlate: string;
  brand: string;
  model: string;
  startTime: DateTimeString;
  endTime: DateTimeString;
  pricePerHour: number;
  pricePerDay: number;
  rentalOption: RentalOption;
  minRentalHours: number | null;
  status: SlotStatus;
  version: number;
  createdAt: DateTimeString;
}

/** Kết quả tìm khung giờ trống (GET /api/slots/search). */
export interface AvailableSlotResponse {
  slotId: number;
  carId: number;
  brand: string;
  model: string;
  carType: string;
  seats: number;
  transmission: string;
  fuelType: string;
  city: string;
  district: string | null;
  pickupAddress: string;
  primaryImageUrl: string | null;
  slotStartTime: DateTimeString;
  slotEndTime: DateTimeString;
  pricePerHour: number;
  pricePerDay: number;
  rentalOption: RentalOption;
}
