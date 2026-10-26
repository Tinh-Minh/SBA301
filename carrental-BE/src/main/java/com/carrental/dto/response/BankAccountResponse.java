package com.carrental.dto.response;

import java.time.LocalDateTime;

/** The full account number is never returned; only the last 4 digits are visible. */
public record BankAccountResponse(long id, long customerId, String bankName, String accountNumberMasked,
        String accountHolder, boolean isDefault, LocalDateTime createdAt) {

}
