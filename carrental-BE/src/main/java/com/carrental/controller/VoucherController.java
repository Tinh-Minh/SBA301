package com.carrental.controller;

import static com.carrental.util.RequestChecks.created;
import static com.carrental.util.RequestChecks.ok;
import static com.carrental.util.RequestChecks.rejectQuery;
import static com.carrental.util.RequestChecks.requirePositiveId;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.request.voucher.VoucherListQuery;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.VoucherResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.VoucherService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
            HttpServletRequest servletRequest, @Valid @RequestBody CreateVoucherRequest request) {
        rejectQuery(servletRequest);
        VoucherResponse saved = service.create(actor, request);
        return created("/api/vouchers/{id}", saved.id(), saved);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<VoucherResponse>>> list(@AuthenticationPrincipal CurrentAccount actor,
            @RequestParam MultiValueMap<String, String> parameters) {
        return ok(service.list(actor, VoucherListQuery.parse(parameters, properties)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VoucherResponse>> get(@AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id, HttpServletRequest servletRequest) {
        rejectQuery(servletRequest);
        requirePositiveId(id);
        return ok(service.get(actor, id));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<VoucherResponse>> update(@AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id, HttpServletRequest servletRequest, @Valid @RequestBody UpdateVoucherAdminRequest request) {
        rejectQuery(servletRequest);
        requirePositiveId(id);
        return ok(service.update(actor, id, request));
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<VoucherResponse>> changeStatus(@AuthenticationPrincipal CurrentAccount actor,
            @PathVariable long id, HttpServletRequest servletRequest, @Valid @RequestBody ChangeVoucherStatusRequest request) {
        rejectQuery(servletRequest);
        requirePositiveId(id);
        return ok(service.changeStatus(actor, id, request));
    }
}
