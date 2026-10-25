package com.carrental.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import com.carrental.web.RequestTraceFilter;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

public final class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {
    private static final Logger log = LoggerFactory.getLogger(ApiAuthenticationEntryPoint.class);
    private final SecurityErrorResponses responses;

    public ApiAuthenticationEntryPoint(SecurityErrorResponses responses) {
        this.responses = responses;
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {
        if (authException instanceof org.springframework.security.authentication.AuthenticationServiceException
                || (authException instanceof org.springframework.security.oauth2.core.OAuth2AuthenticationException oauth2
                && "dependency_unavailable".equals(oauth2.getError().getErrorCode()))) {
            log.error("Security account lookup failed traceId={} exceptionType={}",
                    RequestTraceFilter.currentTraceId(), authException.getClass().getSimpleName());
        }
        responses.authenticationFailure(request, response, authException);
    }
}
