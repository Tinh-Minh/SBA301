package com.carrental.controller;

import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.HealthResponse;
import com.carrental.web.RequestTraceFilter;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "/api/health", produces = MediaType.APPLICATION_JSON_VALUE)
public class HealthController {

    @GetMapping
    public ApiResponse<HealthResponse> health() {
        return ApiResponse.success(new HealthResponse("UP"), RequestTraceFilter.currentTraceId());
    }
}
