export type KycStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
export type CarStatus = "PENDING_APPROVAL" | "ACTIVE" | "INACTIVE" | "REJECTED";
export type SlotStatus = "OPEN" | "CLOSED" | "CANCELLED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type PayoutStatus = "PENDING" | "PROCESSING" | "PAID" | "FAILED";
export type HandoverType = "PICKUP" | "RETURN";

export type CustomerRole = "CUSTOMER" | "ADMIN";
export type AccountStatus = "ACTIVE" | "LOCKED";
export type CarType = "SEDAN" | "HATCHBACK" | "SUV" | "MPV" | "PICKUP" | "LUXURY" | "OTHER";
export type Transmission = "MANUAL" | "AUTOMATIC";
export type FuelType = "GASOLINE" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type SlotRentalOption = "HOURLY" | "DAILY" | "BOTH";
export type RentalType = "HOURLY" | "DAILY";
