import type { BankAccount } from "./bank-account";
import type { Car } from "./car";
import type { CarSlot } from "./car-slot";
import type { Customer } from "./customer";
import type { OrderHandover } from "./order-handover";
import type { Payout } from "./payout";
import type { RentalOrder } from "./rental-order";

/** Đơn thuê kèm dữ liệu join để hiển thị ở O05/O06. */
export interface OwnerOrderView {
  order: RentalOrder;
  car: Car;
  renter: Customer;
  handovers: OrderHandover[];
}

export interface OwnerPayoutView {
  payout: Payout;
  order: RentalOrder;
  car: Car;
}

export interface OwnerCalendarData {
  cars: Car[];
  slots: CarSlot[];
  orders: RentalOrder[];
}

export type OwnerActivityTone = "warning" | "success" | "payment";

export interface OwnerActivityItem {
  id: string;
  icon: string;
  tone: OwnerActivityTone;
  title: string;
  subtitle?: string;
  highlight?: string;
  orderCode?: string;
  at: string;
}

export interface OwnerManagedCar {
  car: Car;
  openSlots: number;
}

export interface OwnerDashboardSummary {
  owner: Customer;
  activeCars: number;
  approvedCars: number;
  totalCars: number;
  pendingOrders: number;
  ongoingTrips: number;
  /** Tổng `grossAmount` đã ghi nhận trong kỳ. */
  recognizedGross: number;
  /** Tổng `netAmount` đang giữ escrow (`PENDING` + `PROCESSING`). */
  escrowNet: number;
  /** Tổng `netAmount` đã chuyển (`PAID`). */
  paidNet: number;
  defaultBankAccount?: BankAccount;
  pendingRequests: OwnerOrderView[];
  managedCars: OwnerManagedCar[];
  activities: OwnerActivityItem[];
  recentPayouts: OwnerPayoutView[];
}

export interface OwnerPayoutStatement {
  defaultBankAccount?: BankAccount;
  rows: OwnerPayoutView[];
  totals: { grossAmount: number; platformFee: number; netAmount: number };
}
