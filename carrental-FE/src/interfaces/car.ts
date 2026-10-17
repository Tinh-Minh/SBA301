import type { CarStatus, CarType, FuelType, Transmission } from "./enums";

/** Bảng `cars`. Tiền tệ là VND nguyên (NUMERIC(14,0)). */
export interface Car {
  id: number;
  ownerId: number;
  licensePlate: string;
  brand: string;
  model: string;
  manufactureYear: number;
  carType: CarType;
  seats: number;
  transmission: Transmission;
  fuelType: FuelType;
  pickupAddress: string;
  pricePerHour: number;
  pricePerDay: number;
  /** Chủ xe tự thu khi bàn giao, không đi qua escrow của nền tảng. */
  depositAmount: number;
  /** Mặc định 350. */
  kmLimitPerDay?: number;
  /** Mặc định 5.000 VND/km. */
  extraKmFee?: number;
  status: CarStatus;
  primaryImageUrl?: string;
}
