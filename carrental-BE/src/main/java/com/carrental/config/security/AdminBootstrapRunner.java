package com.carrental.config.security;

import com.carrental.service.AdminBootstrapService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class AdminBootstrapRunner implements ApplicationRunner {
    private final BootstrapAdminProperties properties;
    private final AdminBootstrapService service;

    public AdminBootstrapRunner(BootstrapAdminProperties properties, AdminBootstrapService service) {
        this.properties = properties;
        this.service = service;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!properties.isEnabled()) {
            return;
        }
        log.info("Bootstrap admin initialization result={}", service.ensureAdmin(properties));
    }
}
