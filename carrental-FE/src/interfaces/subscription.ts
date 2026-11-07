import type { DateTimeString } from "./api";

/** Function 3: gói đăng tin của xe. */

export type SubscriptionStatus = "PENDING_PAYMENT" | "ACTIVE" | "EXPIRED" | "CANCELLED";
export type ListingStatus = "UNLISTED" | "LISTED" | "EXPIRED";

export interface SubscriptionResponse {
  id: number;
  subscriptionCode: string;
  customerId: number;
  customerName: string;
  carId: number;
  carName: string;
  licensePlate: string;
  packageId: number;
  packageName: string;
  durationDays: number;
  badgeLabel: string;
  voucherCode: string | null;
  packagePrice: number;
  discountAmount: number;
  totalAmount: number;
  status: SubscriptionStatus;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  startDate: DateTimeString | null;
  endDate: DateTimeString | null;
  activatedAt: DateTimeString | null;
  createdAt: DateTimeString;
  /** Số ngày còn hiển thị; null khi gói không ở trạng thái ACTIVE. */
  daysRemaining: number | null;
}

export interface SubscriptionPackageOption {
  id: number;
  code: string;
  name: string;
  price: number;
  durationDays: number;
  priorityLevel: number;
  badgeLabel: string;
  description: string | null;
}

/** POST /api/subscriptions/quote */
export interface SubscriptionQuoteResponse {
  carId: number;
  packageId: number;
  packageName: string;
  durationDays: number;
  voucherCode: string | null;
  packagePrice: number;
  discountAmount: number;
  totalAmount: number;
}
