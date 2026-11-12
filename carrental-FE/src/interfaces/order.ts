import type { DateTimeString } from "./api";

/** Function 3: đặt xe và vòng đời đơn (RentalOrderController, HandoverController). */

export type OrderStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type RentalType = "HOURLY" | "DAILY";
export type HandoverType = "PICKUP" | "RETURN";

/** POST /api/orders/quote */
export interface QuoteRequest {
  carSlotId: number;
  rentalType: RentalType;
  startTime: DateTimeString;
  endTime: DateTimeString;
  voucherCode?: string | null;
}

/** POST /api/orders */
export interface CreateOrderRequest extends QuoteRequest {
  note?: string | null;
}

/** Body tuỳ chọn của PUT /api/orders/{id}/confirm | reject | cancel */
export interface OrderActionRequest {
  reason?: string | null;
}

export interface PriceQuoteResponse {
  carSlotId: number;
  rentalType: RentalType;
  startTime: DateTimeString;
  endTime: DateTimeString;
  unitPrice: number;
  quantity: number;
  rentalAmount: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  voucherId: number | null;
  voucherCode: string | null;
}

export interface OrderResponse {
  id: number;
  orderCode: string;
  customerId: number;
  customerName: string;
  carId: number;
  carName: string;
  licensePlate: string;
  ownerId: number;
  ownerName: string;
  carSlotId: number;
  voucherId: number | null;
  voucherCode: string | null;
  rentalType: RentalType;
  startTime: DateTimeString;
  endTime: DateTimeString;
  actualStartTime: DateTimeString | null;
  actualEndTime: DateTimeString | null;
  unitPrice: number;
  quantity: number;
  rentalAmount: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  commissionRate: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  expiresAt: DateTimeString | null;
  confirmedAt: DateTimeString | null;
  cancelledAt: DateTimeString | null;
  cancelledById: number | null;
  cancelReason: string | null;
  note: string | null;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface ActionLogResponse {
  id: number;
  orderId: number;
  /** null = hệ thống */
  actorId: number | null;
  actorName: string;
  action: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus | null;
  note: string | null;
  createdAt: DateTimeString;
}

export interface HandoverImageRequest {
  imageUrl: string;
  caption?: string | null;
}

/** POST /api/orders/{id}/handovers */
export interface CreateHandoverRequest {
  handoverType: HandoverType;
  odometerKm?: number | null;
  fuelPercent?: number | null;
  conditionNote?: string | null;
  images?: HandoverImageRequest[];
}

export interface HandoverResponse {
  id: number;
  orderId: number;
  handoverType: HandoverType;
  odometerKm: number | null;
  fuelPercent: number | null;
  conditionNote: string | null;
  handedAt: DateTimeString;
  renterConfirmedAt: DateTimeString | null;
  ownerConfirmedAt: DateTimeString | null;
  fullyConfirmed: boolean;
  createdAt: DateTimeString;
  images: { id: number; imageUrl: string; caption: string | null }[];
}
