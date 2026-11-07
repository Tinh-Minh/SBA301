package com.carrental.security;

import com.carrental.dto.response.ApiResponse;
import com.carrental.exception.ErrorCode;
import com.carrental.web.RequestTraceFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationServiceException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.stereotype.Component;
import tools.jackson.databind.json.JsonMapper;

@Component
public class SecurityErrorResponses {
    private final JsonMapper jsonMapper;

    public SecurityErrorResponses(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
    }

    public void authenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException {
        ErrorCode code;
        if (exception instanceof AuthenticationServiceException
                || (exception instanceof OAuth2AuthenticationException oauth2
                && "dependency_unavailable".equals(oauth2.getError().getErrorCode()))) {
            code = ErrorCode.DEPENDENCY_UNAVAILABLE;
        } else if (exception instanceof InvalidBearerTokenException || exception instanceof InvalidCurrentAccountException) {
            code = ErrorCode.INVALID_TOKEN;
        } else if (hasBearerHeader(request)) {
            code = ErrorCode.INVALID_TOKEN;
        } else {
            code = ErrorCode.AUTHENTICATION_FAILED;
        }
        write(response, code, hasBearerHeader(request));
    }

    public void accessDenied(HttpServletRequest request, HttpServletResponse response) throws IOException {
        write(response, ErrorCode.ACCESS_DENIED, false);
    }

    private void write(HttpServletResponse response, ErrorCode code, boolean hadAuthorizationHeader) throws IOException {
        response.setStatus(code.status().value());
        response.setCharacterEncoding(java.nio.charset.StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        if (code == ErrorCode.AUTHENTICATION_FAILED || code == ErrorCode.INVALID_TOKEN) {
            response.setHeader("WWW-Authenticate", hadAuthorizationHeader
                    ? "Bearer error=\"invalid_token\"" : "Bearer");
        }
        jsonMapper.writeValue(response.getOutputStream(),
                ApiResponse.failure(code, RequestTraceFilter.currentTraceId(), List.of()));
    }

    private boolean hasBearerHeader(HttpServletRequest request) {
        String authorization = request.getHeader("Authorization");
        return authorization != null && authorization.regionMatches(true, 0, "Bearer", 0, 6);
    }
}
