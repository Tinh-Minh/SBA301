import type { DateTimeString } from "./api";

/** Function 1: tài khoản, hồ sơ, ngân hàng, tài xế, voucher. */

export type Role = "CUSTOMER" | "ADMIN";
export type KycStatus = "NONE" | "PENDING" | "VERIFIED" | "REJECTED";
export type CustomerStatus = "ACTIVE" | "LOCKED";

/** POST /api/auth/login */
export interface TokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  account: { id: number; fullName: string; role: Role };
}

export interface CustomerProfileResponse {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  /** yyyy-MM-dd */
  dateOfBirth: string | null;
  address: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  kycStatus: KycStatus;
  role: Role;
  status: CustomerStatus;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface BankAccountResponse {
  id: number;
  customerId: number;
  bankName: string;
  accountNumberMasked: string;
  accountHolder: string;
  isDefault: boolean;
  createdAt: DateTimeString;
}

export interface DriverResponse {
  id: number;
  customerId: number;
  status: string;
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
}

export interface VoucherResponse {
  id: number;
  code: string;
  description: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  startAt: DateTimeString;
  endAt: DateTimeString;
  usageLimit: number | null;
  perUserLimit: number;
  usedCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: DateTimeString;
  updatedAt: DateTimeString;
  windowState: string;
  evaluatedAt: DateTimeString;
}
