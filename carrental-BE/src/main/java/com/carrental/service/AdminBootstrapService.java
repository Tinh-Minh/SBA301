package com.carrental.service;

import com.carrental.config.security.BootstrapAdminProperties;

/** Initializes the configured administrator account during application startup. */
public interface AdminBootstrapService {

    enum Result { CREATED, ALREADY_PRESENT, DISABLED }

    Result ensureAdmin(BootstrapAdminProperties properties);
}
