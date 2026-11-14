package com.carrental.dto.response;

import com.carrental.entity.Customer;
import com.carrental.dto.request.*;

public record BankAccountResponse(boolean configured, String accountNumber, String bankName, String bankBranch,
                                  String accountHolder) {
    public static BankAccountResponse from(Customer c) {
        return new BankAccountResponse(c.hasBankAccount(), c.getBankAccountNumber(), c.getBankName(),
                c.getBankBranch(), c.getBankAccountHolder());
    }
}
