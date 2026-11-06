package com.carrental.controller;

import static com.carrental.util.RequestChecks.created;
import static com.carrental.util.RequestChecks.ok;
import static com.carrental.util.RequestChecks.rejectQuery;
import static com.carrental.util.RequestChecks.requirePositiveId;

import com.carrental.dto.request.listingpackage.ListingPackageCreateRequest;
import com.carrental.dto.request.listingpackage.ListingPackageUpdateRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.ListingPackageResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.ListingPackageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api", produces = MediaType.APPLICATION_JSON_VALUE)
public class ListingPackageController {

    private final ListingPackageService service;

    public ListingPackageController(ListingPackageService service) {
        this.service = service;
    }

    @GetMapping("/packages")
    public ResponseEntity<ApiResponse<List<ListingPackageResponse>>> publicPackages() {
        return ok(service.getPublicActivePackages());
    }

    @GetMapping("/admin/packages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ListingPackageResponse>>> adminPackages(
            @AuthenticationPrincipal CurrentAccount actor) {
        return ok(service.listAdminPackages(actor));
    }

    @GetMapping("/admin/packages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingPackageResponse>> adminPackage(
            @AuthenticationPrincipal CurrentAccount actor, @PathVariable long id,
            HttpServletRequest request) {
        rejectQuery(request);
        requirePositiveId(id);
        return ok(service.getAdminPackage(actor, id));
    }

    @PostMapping(path = "/admin/packages", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingPackageResponse>> create(
            @AuthenticationPrincipal CurrentAccount actor, HttpServletRequest request,
            @Valid @RequestBody ListingPackageCreateRequest body) {
        rejectQuery(request);
        ListingPackageResponse saved = service.createPackage(actor, body);
        return created("/api/admin/packages/{id}", saved.id(), saved);
    }

    @PutMapping(path = "/admin/packages/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ListingPackageResponse>> update(
            @AuthenticationPrincipal CurrentAccount actor, @PathVariable long id,
            HttpServletRequest request, @Valid @RequestBody ListingPackageUpdateRequest body) {
        rejectQuery(request);
        requirePositiveId(id);
        return ok(service.updatePackage(actor, id, body));
    }
}
