package com.carrental.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

public final class ApiAccessDeniedHandler implements AccessDeniedHandler {
    private final SecurityErrorResponses responses;

    public ApiAccessDeniedHandler(SecurityErrorResponses responses) {
        this.responses = responses;
    }

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response,
            AccessDeniedException accessDeniedException) throws IOException, ServletException {
        responses.accessDenied(request, response);
    }
}
