package com.carrental.web;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import com.carrental.dto.response.ApiResponse;
import com.carrental.exception.ErrorCode;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import tools.jackson.databind.json.JsonMapper;

@Component
public class RequestTraceFilter extends OncePerRequestFilter {

    public static final String HEADER_NAME = "X-Request-ID";
    public static final String MDC_KEY = "traceId";
    private static final JsonMapper JSON = JsonMapper.builder().build();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        String traceId = UUID.randomUUID().toString();
        MDC.put(MDC_KEY, traceId);
        try {
            response.setHeader(HEADER_NAME, traceId);
            if (isDriverCreate(request) && request.getInputStream().read() != -1) {
                rejectRequest(response, traceId);
                return;
            }
            if (isBankAccountBodylessCommand(request)
                    && (request.getQueryString() != null || request.getInputStream().read() != -1)) {
                // Run before Spring's multipart resolver so it cannot consume a body before the route guard.
                rejectRequest(response, traceId);
                return;
            }
            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(MDC_KEY);
        }
    }

    public static String currentTraceId() {
        return MDC.get(MDC_KEY);
    }

    private boolean isDriverCreate(HttpServletRequest request) {
        return "POST".equals(request.getMethod()) && "/api/drivers".equals(request.getServletPath());
    }

    private boolean isBankAccountBodylessCommand(HttpServletRequest request) {
        String path = request.getServletPath();
        if ("PATCH".equals(request.getMethod())) return path.matches("/api/bank-accounts/[^/]+/default");
        if ("DELETE".equals(request.getMethod())) return path.matches("/api/bank-accounts/[^/]+");
        return false;
    }

    private void rejectRequest(HttpServletResponse response, String traceId) throws IOException {
        response.setStatus(ErrorCode.INVALID_REQUEST.status().value());
        response.setContentType("application/json");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write(JSON.writeValueAsString(
                ApiResponse.failure(ErrorCode.INVALID_REQUEST, traceId, java.util.List.of())));
    }
}
