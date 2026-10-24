package com.carrental.config.security;

import com.carrental.repository.CustomerRepository;
import com.carrental.security.ApiAccessDeniedHandler;
import com.carrental.security.ApiAuthenticationEntryPoint;
import com.carrental.security.CurrentAccountJwtAuthenticationConverter;
import com.carrental.security.CustomerUserDetailsService;
import com.carrental.security.SecurityErrorResponses;
import com.carrental.web.RequestTraceFilter;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration(proxyBeanMethods = false)
@EnableMethodSecurity
public class SecurityConfiguration {

    @Bean
    PasswordEncoder passwordEncoder(PasswordPolicyProperties properties) {
        return new DelegatingPasswordEncoder("bcrypt", Map.of("bcrypt", new BCryptPasswordEncoder(properties.bcryptStrength())));
    }

    @Bean
    AuthenticationManager authenticationManager(CustomerUserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return new org.springframework.security.authentication.ProviderManager(provider);
    }

    @Bean
    CurrentAccountJwtAuthenticationConverter currentAccountJwtAuthenticationConverter(CustomerRepository customers) {
        return new CurrentAccountJwtAuthenticationConverter(customers);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(CorsProperties properties) {
        List<String> origins = properties.getAllowedOrigins().stream()
                .filter(origin -> origin != null && !origin.isBlank())
                .map(String::trim)
                .toList();
        origins.forEach(SecurityConfiguration::validateOrigin);
        rejectWildcard(properties.getAllowedMethods());
        rejectWildcard(properties.getAllowedHeaders());
        rejectWildcard(properties.getExposedHeaders());

        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(origins);
        cors.setAllowedMethods(properties.getAllowedMethods());
        cors.setAllowedHeaders(properties.getAllowedHeaders());
        cors.setExposedHeaders(properties.getExposedHeaders());
        cors.setAllowCredentials(false);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", cors);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
            CorsConfigurationSource corsConfigurationSource,
            CurrentAccountJwtAuthenticationConverter authenticationConverter,
            JwtDecoder jwtDecoder,
            SecurityErrorResponses responses) throws Exception {
        ApiAuthenticationEntryPoint entryPoint = new ApiAuthenticationEntryPoint(responses);
        ApiAccessDeniedHandler deniedHandler = new ApiAccessDeniedHandler(responses);
        http.cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .exceptionHandling(errors -> errors.authenticationEntryPoint(entryPoint).accessDeniedHandler(deniedHandler))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(org.springframework.web.cors.CorsUtils::isPreFlightRequest).permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/cars/search", "/api/cars/{id:[0-9]+}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/slots/search", "/api/slots/{id:[0-9]+}").permitAll()
                        .requestMatchers(HttpMethod.GET,
                                "/api/payments/vnpay/return", "/api/payments/vnpay/ipn",
                                "/api/transactions/vnpay-return", "/api/transactions/vnpay-ipn").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs", "/v3/api-docs/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(resourceServer -> resourceServer
                        .authenticationEntryPoint(entryPoint)
                        .jwt(jwt -> jwt.decoder(jwtDecoder).jwtAuthenticationConverter(authenticationConverter)));
        return http.build();
    }

    @Bean
    FilterRegistrationBean<RequestTraceFilter> requestTraceFilterRegistration(RequestTraceFilter filter) {
        FilterRegistrationBean<RequestTraceFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setOrder(Ordered.HIGHEST_PRECEDENCE);
        registration.setName("requestTraceFilter");
        return registration;
    }

    private static void validateOrigin(String origin) {
        try {
            URI uri = URI.create(origin);
            String exactOrigin = uri.getScheme() + "://" + uri.getRawAuthority();
            if (( !"http".equalsIgnoreCase(uri.getScheme()) && !"https".equalsIgnoreCase(uri.getScheme()))
                    || uri.getHost() == null || uri.getUserInfo() != null || uri.getRawQuery() != null
                    || uri.getRawFragment() != null || (uri.getRawPath() != null && !uri.getRawPath().isEmpty())
                    || !origin.equals(exactOrigin) || "null".equalsIgnoreCase(origin)) {
                throw new IllegalStateException("CORS origins must be exact HTTP or HTTPS origins");
            }
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("CORS origins must be exact HTTP or HTTPS origins");
        }
    }

    private static void rejectWildcard(List<String> values) {
        if (values.stream().anyMatch(value -> value == null || value.contains("*"))) {
            throw new IllegalStateException("CORS methods and headers must use explicit allowlists");
        }
    }
}
