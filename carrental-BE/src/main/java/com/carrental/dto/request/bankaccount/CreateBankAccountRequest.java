package com.carrental.dto.request.bankaccount;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBankAccountRequest(
        @NotBlank @Size(max = 100) String bankName,
        @NotBlank @Size(max = 30) String accountNumber,
        @NotBlank @Size(max = 150) String accountHolder,
        Boolean makeDefault) {

    public CreateBankAccountRequest {
        makeDefault = Boolean.TRUE.equals(makeDefault);
    }

    public boolean shouldMakeDefault() {
        return Boolean.TRUE.equals(makeDefault);
    }

    public String normalizedBankName() {
        return bankName.strip();
    }

    public String normalizedAccountNumber() {
        return accountNumber.strip();
    }

    public String normalizedAccountHolder() {
        return accountHolder.strip();
    }
}
