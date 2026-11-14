package com.carrental.dto.request;

import com.carrental.dto.response.*;

public record BankAccountRequest(String accountNumber, String bankName, String bankBranch, String accountHolder) {}
