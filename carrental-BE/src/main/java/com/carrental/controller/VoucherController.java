package com.carrental.controller;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.request.voucher.VoucherListQuery;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.VoucherResponse;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.security.CurrentAccount;
import com.carrental.service.VoucherService;
import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping(path = "/api/vouchers", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasRole('ADMIN')")
public class VoucherController {
    private final VoucherService service;
    private final CustomerProperties properties;

    public VoucherController(VoucherService service, CustomerProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<VoucherResponse>> create(@AuthenticationPrincipal CurrentAccount actor,
            HttpServletRequest servletRequest, @RequestBody CreateVoucherRequest request) {
        rejectQuery(servletRequest);
        VoucherResponse created = service.create(actor, request);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/vouchers/{id}")
                        .buildAndExpand(created.id()).toUri())
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(created, RequestTraceFilter.currentTraceId()));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<VoucherResponse>>> list(@AuthenticationPrincipal CurrentAccount actor,
            @RequestParam MultiValueMap<String, String> parameters) {
        return success(service.list(actor, VoucherListQuery.parse(parameters, properties)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> get(@AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id, HttpServletRequest servletRequest) {
        rejectQuery(servletRequest);
        requirePositiveId(id);
        return success(service.get(actor, id));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<VoucherResponse>> update(@AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id, HttpServletRequest servletRequest, @RequestBody UpdateVoucherAdminRequest request) {
        rejectQuery(servletRequest);
        requirePositiveId(id);
        return success(service.update(actor, id, request));
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<VoucherResponse>> changeStatus(@AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id, HttpServletRequest servletRequest, @RequestBody ChangeVoucherStatusRequest request) {
        rejectQuery(servletRequest);
        requirePositiveId(id);
        return success(service.changeStatus(actor, id, request));
    }

    private void rejectQuery(HttpServletRequest request) {
        if (request.getQueryString() != null) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(data, RequestTraceFilter.currentTraceId()));
    }
}
