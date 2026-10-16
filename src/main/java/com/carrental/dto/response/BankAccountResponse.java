package com.carrental.dto.response;

import java.time.LocalDateTime;

/** Safe HTTP projection; it has no property capable of carrying the full account number. */
public record BankAccountResponse(long id, long customerId, String bankName, String accountNumberMasked,
        String accountHolder, boolean isDefault, LocalDateTime createdAt) { }
