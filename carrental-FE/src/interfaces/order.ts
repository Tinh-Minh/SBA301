import type { PageParams } from "./api";

// Kiểu dữ liệu khớp DTO của Function 3 (đặt xe & vòng đời đơn) ở backend.

export type RentalType = "HOURLY" | "DAILY";
export type OrderStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "EXPIRED" | "ONGOING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type HandoverType = "PICKUP" | "RETURN";

/** QuoteRequestDTO – thời gian dạng "yyyy-MM-ddTHH:mm:ss" giờ Việt Nam. */
export interface QuoteRequest {
  carSlotId: number;
  rentalType: RentalType;
  startTime: string;
  endTime: string;
  voucherCode?: string | null;
}

/** CreateOrderRequestDTO */
export interface CreateOrderRequest extends QuoteRequest {
  note?: string | null;
}

/** PriceQuoteDTO */
export interface PriceQuote {
  carSlotId: number;
  rentalType: RentalType;
  startTime: string;
  endTime: string;
  unitPrice: number;
  quantity: number;
  rentalAmount: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  voucherId: number | null;
  voucherCode: string | null;
}

/** OrderResponseDTO */
export interface Order {
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
  startTime: string;
  endTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  unitPrice: number;
  quantity: number;
  rentalAmount: number;
  discountAmount: number;
  totalAmount: number;
  depositAmount: number;
  commissionRate: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  expiresAt: string | null;
  confirmedAt: string | null;
  cancelledAt: string | null;
  cancelledById: number | null;
  cancelReason: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Tham số lọc danh sách đơn. */
export interface OrderListParams extends PageParams {
  status?: OrderStatus;
}

/** ActionLogDTO – lịch sử đơn. */
export interface ActionLog {
  id: number;
  orderId: number;
  actorId: number | null;
  actorName: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  note: string | null;
  createdAt: string;
}

/** HandoverImageRequestDTO */
export interface HandoverImageRequest {
  imageUrl: string;
  caption?: string | null;
}

/** CreateHandoverRequestDTO */
export interface CreateHandoverRequest {
  handoverType: HandoverType;
  odometerKm?: number | null;
  fuelPercent?: number | null;
  conditionNote?: string | null;
  images?: HandoverImageRequest[];
}

/** HandoverResponseDTO */
export interface Handover {
  id: number;
  orderId: number;
  handoverType: HandoverType;
  odometerKm: number | null;
  fuelPercent: number | null;
  conditionNote: string | null;
  handedAt: string;
  renterConfirmedAt: string | null;
  ownerConfirmedAt: string | null;
  fullyConfirmed: boolean;
  createdAt: string;
  images: { id: number; imageUrl: string; caption: string | null }[];
}
