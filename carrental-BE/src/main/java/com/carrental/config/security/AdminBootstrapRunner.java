package com.carrental.config.security;

import com.carrental.service.impl.AdminBootstrapService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapRunner.class);
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
