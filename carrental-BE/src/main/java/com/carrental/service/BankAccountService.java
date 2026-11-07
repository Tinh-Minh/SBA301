package com.carrental.service;

import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;
import org.springframework.data.domain.Pageable;

public interface BankAccountService {

    PageResponse<BankAccountResponse> listMine(CurrentAccount account, Pageable pageable);

    BankAccountResponse getMine(CurrentAccount account, long bankAccountId);

    BankAccountResponse create(CurrentAccount account, CreateBankAccountRequest request);

    BankAccountResponse setDefault(CurrentAccount account, long bankAccountId);

    void delete(CurrentAccount account, long bankAccountId);
}
