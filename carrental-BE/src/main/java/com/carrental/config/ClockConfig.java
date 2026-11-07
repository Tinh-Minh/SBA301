package com.carrental.config;

import java.time.Clock;
import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration(proxyBeanMethods = false)
public class ClockConfig {

    @Bean
    Clock applicationClock(@Value("${app.time.zone:Asia/Ho_Chi_Minh}") String timeZone) {
        return Clock.system(ZoneId.of(timeZone));
    }
}
