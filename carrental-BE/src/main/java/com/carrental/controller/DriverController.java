package com.carrental.controller;

import static com.carrental.util.RequestChecks.created;
import static com.carrental.util.RequestChecks.ok;
import static com.carrental.util.RequestChecks.rejectBodylessQueryOrBytes;
import static com.carrental.util.RequestChecks.rejectQuery;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.driver.ChangeDriverStatusRequest;
import com.carrental.dto.request.driver.DriverListQuery;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.DriverService;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
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
        rejectBodylessQueryOrBytes(request);
        DriverResponse saved = service.createForMe(account);
        return created("/api/drivers/{id}", saved.id(), saved);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> me(@AuthenticationPrincipal CurrentAccount account) {
        return ok(service.getMe(account));
    }

    @GetMapping("/me/eligibility")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverEligibilityResponse>> myEligibility(
            @AuthenticationPrincipal CurrentAccount account) {
        return ok(service.getMyEligibility(account));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<DriverResponse>>> list(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestParam MultiValueMap<String, String> parameters) {
        return ok(service.list(account, DriverListQuery.parse(parameters, properties)));
    }

    @GetMapping("/{id}/eligibility")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverEligibilityResponse>> eligibility(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id) {
        return ok(service.getEligibility(account, id));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> get(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id) {
        return ok(service.getById(account, id));
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DriverResponse>> changeStatus(
            @AuthenticationPrincipal CurrentAccount actor, @PathVariable long id,
            HttpServletRequest request, @RequestBody ChangeDriverStatusRequest command) {
        rejectQuery(request);
        return ok(service.changeStatus(actor, id, command));
    }
}
