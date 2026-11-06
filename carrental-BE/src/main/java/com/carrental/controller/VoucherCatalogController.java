package com.carrental.controller;

import static com.carrental.util.RequestChecks.ok;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.VoucherCatalogResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.VoucherCatalogService;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/vouchers/available", produces = MediaType.APPLICATION_JSON_VALUE)
public class VoucherCatalogController {

    private final VoucherCatalogService service;

    public VoucherCatalogController(VoucherCatalogService service) {
        this.service = service;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<VoucherCatalogResponse>>> listAvailable(
            @AuthenticationPrincipal CurrentAccount actor, @RequestParam long packageId) {
        return ok(service.listAvailableForPackage(actor, packageId));
    }
}
