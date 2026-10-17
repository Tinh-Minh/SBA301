package com.carrental.controller;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.bankaccount.BankAccountListQuery;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.security.CurrentAccount;
import com.carrental.service.BankAccountService;
import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import org.springframework.http.CacheControl;
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
import org.springframework.web.util.UriComponentsBuilder;

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
        BankAccountResponse created = service.create(account, command);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/bank-accounts/{id}")
                        .buildAndExpand(created.id()).toUri())
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(created, RequestTraceFilter.currentTraceId()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BankAccountResponse>>> list(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestParam MultiValueMap<String, String> parameters) {
        return success(service.list(account, BankAccountListQuery.parse(parameters, properties)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> get(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id, HttpServletRequest request) {
        rejectQuery(request);
        return success(service.get(account, id));
    }

    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<BankAccountResponse>> setDefault(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id, HttpServletRequest request)
            throws IOException {
        rejectBodylessQueryOrBytes(request);
        return success(service.setDefault(account, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id, HttpServletRequest request)
            throws IOException {
        rejectBodylessQueryOrBytes(request);
        service.delete(account, id);
        return success(null);
    }

    private void rejectQuery(HttpServletRequest request) {
        if (request.getQueryString() != null) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private void rejectBodylessQueryOrBytes(HttpServletRequest request) throws IOException {
        rejectQuery(request);
        // One-byte ingress probe catches whitespace, JSON, form, multipart and chunked payloads.
        if (request.getInputStream().read() != -1) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(data, RequestTraceFilter.currentTraceId()));
    }
}
