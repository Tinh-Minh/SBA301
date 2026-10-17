import type { OrderStatus, PaymentStatus, RentalType } from "./enums";

/** Bảng `rental_orders`. */
export interface RentalOrder {
  id: number;
  /** Ví dụ `CDB-ORD-20261026-904`. */
  orderCode: string;
  /** Người thuê. */
  customerId: number;
  carId: number;
  carSlotId: number;
  rentalType: RentalType;
  startTime: string;
  endTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  unitPrice: number;
  quantity: number;
  /** `unitPrice * quantity`. */
  rentalAmount: number;
  /** Voucher do CarDB tài trợ, không trừ vào payout của chủ xe. */
  discountAmount: number;
  /** `rentalAmount - discountAmount`, số tiền người thuê thanh toán. */
  totalAmount: number;
  depositAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  /** Phần trăm, mặc định 10.00. */
  commissionRate: number;
  /** Hạn chủ xe phản hồi yêu cầu (2 giờ). */
  expiresAt?: string;
}
