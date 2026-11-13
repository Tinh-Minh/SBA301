package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.service.BankAccountService;
import com.carrental.service.BankAccountService.BankAccountRequest;
import com.carrental.service.BankAccountService.BankAccountResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Tài khoản ngân hàng nhận tiền hoàn cọc / tiền thuê của người dùng đang đăng nhập. */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customers/me/bank-account")
public class BankAccountController {

    private final BankAccountService bankAccountService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ApiResponse<BankAccountResponse> mine() {
        return ApiResponse.ok(bankAccountService.mine());
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping
    public ApiResponse<BankAccountResponse> update(@RequestBody BankAccountRequest request) {
        return ApiResponse.ok("Đã cập nhật tài khoản ngân hàng", bankAccountService.update(request));
    }
}
