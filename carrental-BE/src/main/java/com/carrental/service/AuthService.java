package com.carrental.service;

import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.security.CurrentAccount;

public interface AuthService {
    CustomerProfileResponse register(RegisterRequest request);
    default CustomerProfileResponse register(RegisterRequest request, String clientIp) {
        return register(request);
    }
    TokenResponse login(LoginRequest request);
    void verifyEmail(String token);
    void resendVerification(String email);
    default void resendVerification(String email, String clientIp) {
        resendVerification(email);
    }
    void changePassword(CurrentAccount account, ChangePasswordRequest request);
}
