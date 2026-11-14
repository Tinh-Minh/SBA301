package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.config.CustomerProperties;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

class CustomerPropertiesTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(PropertiesConfiguration.class);

    @Test
    void customerPagingDefaultsAndLimitsAreValidatedAtStartup() {
        contextRunner
                .withPropertyValues("app.customer.default-page-size=101", "app.customer.max-page-size=100")
                .run(context -> assertThat(context).hasFailed());

        contextRunner
                .withPropertyValues("app.customer.default-page-size=0", "app.customer.max-page-size=100")
                .run(context -> assertThat(context).hasFailed());
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(CustomerProperties.class)
    static class PropertiesConfiguration {
    }
}
