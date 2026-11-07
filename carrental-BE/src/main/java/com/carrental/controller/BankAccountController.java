package com.carrental.controller;

import static com.carrental.util.RequestChecks.created;
import static com.carrental.util.RequestChecks.ok;
import static com.carrental.util.RequestChecks.rejectBodylessQueryOrBytes;
import static com.carrental.util.RequestChecks.requirePositiveId;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.BankAccountService;
import com.carrental.util.ListQueryParser;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.Set;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "/api/bank-accounts", produces = MediaType.APPLICATION_JSON_VALUE)
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
public class BankAccountController {

    private static final Set<String> LIST_PARAMETERS = Set.of("page", "size", "sort");
    private static final Set<String> SORT_FIELDS = Set.of("id", "createdAt", "bankName", "isDefault");

    private final BankAccountService service;
    private final CustomerProperties customerProperties;

    public BankAccountController(BankAccountService service, CustomerProperties customerProperties) {
        this.service = service;
        this.customerProperties = customerProperties;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BankAccountResponse>>> list(
            @AuthenticationPrincipal CurrentAccount account,
            @RequestParam MultiValueMap<String, String> parameters) {
        ListQueryParser.requireAllowed(parameters, LIST_PARAMETERS);
        var pageable = ListQueryParser.pageable(parameters, customerProperties.getDefaultPageSize(),
                customerProperties.getMaxPageSize(), SORT_FIELDS);
        return ok(service.listMine(account, pageable));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<BankAccountResponse>> create(
            @AuthenticationPrincipal CurrentAccount account,
            @Valid @RequestBody CreateBankAccountRequest request) {
        BankAccountResponse saved = service.create(account, request);
        return created("/api/bank-accounts/{id}", saved.id(), saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BankAccountResponse>> get(
            @AuthenticationPrincipal CurrentAccount account, @PathVariable long id) {
        requirePositiveId(id);
        return ok(service.getMine(account, id));
    }

    @PatchMapping(path = "/{id}/default")
    public ResponseEntity<ApiResponse<BankAccountResponse>> setDefault(
            @AuthenticationPrincipal CurrentAccount account,
            @PathVariable long id,
            HttpServletRequest request) throws IOException {
        requirePositiveId(id);
        rejectBodylessQueryOrBytes(request);
        return ok(service.setDefault(account, id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal CurrentAccount account,
            @PathVariable long id,
            HttpServletRequest request) throws IOException {
        requirePositiveId(id);
        rejectBodylessQueryOrBytes(request);
        service.delete(account, id);
        return ok(null);
    }
}
