import type { HandoverType } from "./enums";

/** Bảng `order_handovers`: biên bản C10-A (PICKUP) và C10-B (RETURN). */
export interface OrderHandover {
  id: number;
  orderId: number;
  handoverType: HandoverType;
  odometerKm: number;
  /** 0–100, là % nhiên liệu hoặc % pin với xe điện. */
  fuelPercent: number;
  conditionNote?: string;
  handedAt: string;
  renterConfirmedAt?: string;
  ownerConfirmedAt?: string;
}
