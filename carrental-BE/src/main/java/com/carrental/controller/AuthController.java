package com.carrental.controller;

import static com.carrental.util.RequestChecks.ok;

import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.ResendVerificationRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.request.auth.VerifyEmailRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.security.CurrentAccount;
import com.carrental.service.AuthService;
import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(path = "/register", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        return ResponseEntity.status(HttpStatus.CREATED)
                .cacheControl(CacheControl.noStore())
                .body(ApiResponse.success(authService.register(request, clientIp), RequestTraceFilter.currentTraceId()));
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<TokenResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ok(authService.login(request));
    }

    @PostMapping(path = "/verify-email", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.token());
        return ok(null);
    }

    @PostMapping(path = "/resend-verification", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request,
            HttpServletRequest httpRequest) {
        String clientIp = extractClientIp(httpRequest);
        authService.resendVerification(request.email(), clientIp);
        return ok(null);
    }

    private static String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        return request.getRemoteAddr() != null ? request.getRemoteAddr() : "127.0.0.1";
    }

    @PostMapping(path = "/change-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal CurrentAccount account,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(account, request);
        return ok(null);
    }
}
