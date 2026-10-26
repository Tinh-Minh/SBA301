package com.carrental.controller;

import static com.carrental.util.RequestChecks.created;
import static com.carrental.util.RequestChecks.ok;
import static com.carrental.util.RequestChecks.rejectBodylessQueryOrBytes;
import static com.carrental.util.RequestChecks.rejectQuery;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.bankaccount.BankAccountListQuery;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.BankAccountService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/bank-accounts", produces = MediaType.APPLICATION_JSON_VALUE)
public class BankAccountController {
    private final BankAccountService service;
    private final CustomerProperties properties;

    public BankAccountController(BankAccountService service, CustomerProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<BankAccountResponse>> create(
            @AuthenticationPrincipal CurrentAccount account, HttpServletRequest request,
            @RequestBody CreateBankAccountRequest command) {
        rejectQuery(request);
        BankAccountResponse saved = service.create(account, command);
        return created("/api/bank-accounts/{id}", saved.id(), saved);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BankAccountResponse>>> list(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestParam MultiValueMap<String, String> parameters) {
        return ok(service.list(account, BankAccountListQuery.parse(parameters, properties)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> get(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id, HttpServletRequest request) {
        rejectQuery(request);
        return ok(service.get(account, id));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<BankAccountResponse>> setDefault(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id, HttpServletRequest request)
            throws IOException {
        rejectBodylessQueryOrBytes(request);
        return ok(service.setDefault(account, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id, HttpServletRequest request)
            throws IOException {
        rejectBodylessQueryOrBytes(request);
        service.delete(account, id);
        return ok(null);
    }
}
