package com.carrental.service;

import com.carrental.dto.request.auth.ChangePasswordRequest;
import com.carrental.dto.request.auth.LoginRequest;
import com.carrental.dto.request.auth.RegisterRequest;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.TokenResponse;
import com.carrental.security.CurrentAccount;

public interface AuthService {
    CustomerProfileResponse register(RegisterRequest request);
    TokenResponse login(LoginRequest request);
    void changePassword(CurrentAccount account, ChangePasswordRequest request);
}
