package com.carrental.dto.response;

import com.carrental.entity.BankAccount;

import java.time.LocalDateTime;

/** The full account number is never returned; only the last 4 digits are visible. */
public record BankAccountResponse(long id, long customerId, String bankName, String accountNumberMasked,
        String accountHolder, boolean isDefault, LocalDateTime createdAt) {

    public static BankAccountResponse from(BankAccount account) {
        return new BankAccountResponse(account.getId(), account.getCustomer().getId(), account.getBankName(),
                mask(account.getAccountNumber()), account.getAccountHolder(), account.getIsDefault(), account.getCreatedAt());
    }

    public static String mask(String accountNumber) {
        int length = accountNumber.codePointCount(0, accountNumber.length());
        if (length <= 4) return "*".repeat(Math.max(1, length));
        int visibleOffset = accountNumber.offsetByCodePoints(0, length - 4);
        return "*".repeat(length - 4) + accountNumber.substring(visibleOffset);
    }
}
