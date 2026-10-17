import type { AccountStatus, CustomerRole, KycStatus } from "./enums";

/** Bảng `customers` (chủ xe / khách thuê). */
export interface Customer {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  kycStatus: KycStatus;
  role: CustomerRole;
  status: AccountStatus;
}
