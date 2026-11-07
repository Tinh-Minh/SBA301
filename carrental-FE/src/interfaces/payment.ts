import type { DateTimeString } from "./api";

/** Function 4: thanh toán, chi trả, phí phát sinh, tranh chấp, đánh giá. */

export type TransactionType = "DEPOSIT" | "RENTAL_PAYMENT" | "EXTRA_FEE" | "REFUND";
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED";
export type PaymentMethod = "BANK_TRANSFER" | "MOMO" | "VNPAY" | "CASH";

export interface TransactionResponse {
  id: number;
  orderId: number;
  orderCode: string;
  parentTransactionId: number | null;
  transactionType: TransactionType;
  amount: number;
  method: PaymentMethod;
  status: TransactionStatus;
  providerRef: string | null;
  paidAt: DateTimeString | null;
  createdAt: DateTimeString;
}

export interface PayoutResponse {
  id: number;
  orderId: number;
  orderCode: string;
  recipientId: number;
  recipientName: string;
  bankAccountId: number | null;
  bankName: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED";
  note: string | null;
  paidAt: DateTimeString | null;
}

export interface ExtraFeeResponse {
  id: number;
  orderId: number;
  orderCode: string;
  createdById: number | null;
  createdByName: string | null;
  feeType: string;
  amount: number;
  description: string | null;
  status: "PENDING" | "PAID" | "DISPUTED" | "WAIVED";
  createdAt: DateTimeString;
}

export interface DisputeEvidenceResponse {
  id: number;
  disputeId: number;
  uploadedById: number;
  uploadedByName: string;
  fileUrl: string;
  fileType: "IMAGE" | "VIDEO" | "DOCUMENT";
  description: string | null;
}

export interface DisputeResponse {
  id: number;
  orderId: number;
  orderCode: string;
  extraFeeId: number | null;
  raisedById: number;
  raisedByName: string;
  reason: string;
  description: string | null;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED";
  resolutionNote: string | null;
  resolvedById: number | null;
  resolvedByName: string | null;
  resolvedAt: DateTimeString | null;
  createdAt: DateTimeString;
  evidences?: DisputeEvidenceResponse[];
}

export interface ReviewResponse {
  id: number;
  orderId: number;
  orderCode: string;
  reviewerId: number;
  reviewerName: string;
  revieweeId: number;
  revieweeName: string;
  rating: number;
  comment: string | null;
}
