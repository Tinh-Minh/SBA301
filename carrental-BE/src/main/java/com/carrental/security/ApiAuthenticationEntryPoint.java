package com.carrental.security;

import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

@Slf4j
public final class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {
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
