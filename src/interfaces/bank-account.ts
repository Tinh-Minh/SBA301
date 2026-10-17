/** Bảng `bank_accounts`. */
export interface BankAccount {
  id: number;
  customerId: number;
  bankName: string;
  /** Đã che, ví dụ `007100****982`. */
  accountNumber: string;
  accountHolder: string;
  isDefault: boolean;
}
