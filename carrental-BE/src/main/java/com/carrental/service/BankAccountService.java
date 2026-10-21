package com.carrental.service;

import com.carrental.dto.request.bankaccount.BankAccountListQuery;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;

public interface BankAccountService {
    BankAccountResponse create(CurrentAccount account, CreateBankAccountRequest request);
    PageResponse<BankAccountResponse> list(CurrentAccount account, BankAccountListQuery query);
    BankAccountResponse get(CurrentAccount account, long bankAccountId);
    BankAccountResponse setDefault(CurrentAccount account, long bankAccountId);
    void delete(CurrentAccount account, long bankAccountId);
}
