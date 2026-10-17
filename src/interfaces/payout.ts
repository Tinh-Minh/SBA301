import type { PayoutStatus } from "./enums";

/** Bảng `payouts` (đối soát doanh thu chủ xe). */
export interface Payout {
  id: number;
  orderId: number;
  /** Chủ xe. */
  recipientId: number;
  bankAccountId?: number;
  /** Bằng `rentalOrder.rentalAmount`. */
  grossAmount: number;
  /** `grossAmount * commissionRate / 100`. */
  platformFee: number;
  /** `grossAmount - platformFee`. */
  netAmount: number;
  /** `PENDING` = đang giữ escrow, `PAID` = đã chuyển khoản. */
  status: PayoutStatus;
  paidAt?: string;
}
