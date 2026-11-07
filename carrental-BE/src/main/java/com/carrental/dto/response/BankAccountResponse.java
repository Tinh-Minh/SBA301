package com.carrental.dto.response;

import com.carrental.entity.BankAccount;
import java.time.LocalDateTime;

public record BankAccountResponse(
        long id,
        long customerId,
        String bankName,
        String accountNumberMasked,
        String accountHolder,
        boolean isDefault,
        LocalDateTime createdAt) {

    public static BankAccountResponse from(BankAccount account) {
        return new BankAccountResponse(account.getId(), account.getCustomer().getId(), account.getBankName(),
                mask(account.getAccountNumber()), account.getAccountHolder(), account.isDefault(), account.getCreatedAt());
    }

    private static String mask(String accountNumber) {
        int visibleDigits = Math.min(4, accountNumber.length());
        return "*".repeat(accountNumber.length() - visibleDigits)
                + accountNumber.substring(accountNumber.length() - visibleDigits);
    }
}
