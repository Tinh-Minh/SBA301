package com.carrental.service;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

public interface BankAccountService {

    BankAccountResponse mine();

    BankAccountResponse update(BankAccountRequest request);
}
