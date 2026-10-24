package com.carrental.controller;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.customer.ChangeCustomerStatusRequest;
import com.carrental.dto.request.customer.CustomerListQuery;
import com.carrental.dto.request.customer.UpdateProfileRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.dto.response.KycSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.security.CurrentAccount;
import com.carrental.service.CustomerService;
import com.carrental.service.KycService;
import com.carrental.web.RequestTraceFilter;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/customers", produces = MediaType.APPLICATION_JSON_VALUE)
public class CustomerController {
    private final CustomerService customerService;
    private final CustomerProperties customerProperties;
    private final KycService kycService;

    public CustomerController(CustomerService customerService, CustomerProperties customerProperties, KycService kycService) {
        this.customerService = customerService;
        this.customerProperties = customerProperties;
        this.kycService = kycService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> me(
            @AuthenticationPrincipal CurrentAccount account) {
        return accountResponse(customerService.getMe(account));
    }

    @GetMapping("/me/kyc")
    public ResponseEntity<ApiResponse<KycSummaryResponse>> myKyc(
            @AuthenticationPrincipal CurrentAccount account) {
        return accountResponse(kycService.getMe(account));
    }

    @PatchMapping(path = "/me", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateMe(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestBody UpdateProfileRequest request) {
        return accountResponse(customerService.updateMe(account, request));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<CustomerSummaryResponse>>> listCustomers(
            @RequestParam MultiValueMap<String, String> parameters) {
        CustomerListQuery query = CustomerListQuery.parse(parameters, customerProperties);
        return accountResponse(customerService.listCustomers(query));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> getCustomer(@PathVariable long id) {
        requirePositiveId(id);
        return accountResponse(customerService.getCustomer(id));
    }

    @GetMapping("/{id}/kyc")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<KycSummaryResponse>> getCustomerKyc(@PathVariable long id) {
        requirePositiveId(id);
        return accountResponse(kycService.getCustomer(id));
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CustomerAdminResponse>> changeCustomerStatus(
            @AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id,
            @RequestBody ChangeCustomerStatusRequest request) {
        requirePositiveId(id);
        return accountResponse(customerService.changeCustomerStatus(actor, id, request));
    }

    private <T> ResponseEntity<ApiResponse<T>> accountResponse(T data) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(data, RequestTraceFilter.currentTraceId()));
    }

    private void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }
}
