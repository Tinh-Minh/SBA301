package com.carrental.mapper;

import com.carrental.dto.response.BankAccountResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;

public final class BankAccountMapper {
    private BankAccountMapper() { }

    public static BankAccount toNewEntity(Customer owner, String bankName, String accountNumber,
            String accountHolder, boolean makeDefault) {
        BankAccount account = new BankAccount();
        account.setCustomer(owner);
        account.setBankName(bankName);
        account.setAccountNumber(accountNumber);
        account.setAccountHolder(accountHolder);
        account.setIsDefault(makeDefault);
        return account;
    }

    public static BankAccountResponse toResponse(BankAccount account) {
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
