package com.carrental.controller;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.driver.ChangeDriverStatusRequest;
import com.carrental.dto.request.driver.DriverListQuery;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.security.CurrentAccount;
import com.carrental.service.DriverService;
import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping(path = "/api/drivers", produces = MediaType.APPLICATION_JSON_VALUE)
public class DriverController {

    private final DriverService service;
    private final CustomerProperties properties;

    public DriverController(DriverService service, CustomerProperties properties) {
        this.service = service;
        this.properties = properties;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> create(
            @AuthenticationPrincipal CurrentAccount account, HttpServletRequest request) throws IOException {
        rejectCreateQueryAndBody(request);
        DriverResponse created = service.createForMe(account);
        return ResponseEntity.created(UriComponentsBuilder.fromPath("/api/drivers/{id}")
                        .buildAndExpand(created.id()).toUri())
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(created, RequestTraceFilter.currentTraceId()));
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> me(@AuthenticationPrincipal CurrentAccount account) {
        return success(service.getMe(account));
    }

    @GetMapping("/me/eligibility")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverEligibilityResponse>> myEligibility(
            @AuthenticationPrincipal CurrentAccount account) {
        return success(service.getMyEligibility(account));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<DriverResponse>>> list(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestParam MultiValueMap<String, String> parameters) {
        DriverListQuery query = DriverListQuery.parse(parameters, properties);
        return success(service.list(account, query));
    }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverEligibilityResponse>> eligibility(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id) {
        return success(service.getEligibility(account, id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> get(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id) {
        return success(service.getById(account, id));
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> changeStatus(
            @AuthenticationPrincipal CurrentAccount actor, @PathVariable long id,
            HttpServletRequest request, @RequestBody ChangeDriverStatusRequest command) {
        if (request.getQueryString() != null) throw new AppException(ErrorCode.INVALID_REQUEST);
        return success(service.changeStatus(actor, id, command));
    }

    private void rejectCreateQueryAndBody(HttpServletRequest request) throws IOException {
        if (request.getQueryString() != null) throw new AppException(ErrorCode.INVALID_REQUEST);
        // A one-byte probe rejects every non-empty body (including chunked bodies) without buffering it.
        if (request.getInputStream().read() != -1) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(data, RequestTraceFilter.currentTraceId()));
    }
}
