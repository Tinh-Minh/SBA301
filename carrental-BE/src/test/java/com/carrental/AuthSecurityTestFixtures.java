package com.carrental;

import java.util.Map;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@TestConfiguration(proxyBeanMethods = false)
@Import(AuthSecurityTestFixtures.AdminEndpoint.class)
class AuthSecurityTestFixtures {
    @RestController
    @RequestMapping(path = "/__test/security", produces = MediaType.APPLICATION_JSON_VALUE)
    static class AdminEndpoint {
        @GetMapping("/admin")
        @PreAuthorize("hasRole('ADMIN')")
        Map<String, String> adminOnly() {
            return Map.of("result", "ADMIN_ONLY_TEST_FIXTURE");
        }
    }
}
