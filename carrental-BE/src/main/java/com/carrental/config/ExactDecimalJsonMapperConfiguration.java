package com.carrental.config;

import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tools.jackson.databind.DeserializationFeature;

/** Keeps JSON floating-point tokens exact when they are materialized as JsonNode values. */
@Configuration(proxyBeanMethods = false)
public class ExactDecimalJsonMapperConfiguration {

    @Bean
    JsonMapperBuilderCustomizer exactDecimalJsonMapperCustomizer() {
        return builder -> builder.enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);
    }
}
