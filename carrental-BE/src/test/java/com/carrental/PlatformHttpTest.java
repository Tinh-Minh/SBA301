package com.carrental;

import java.time.Clock;
import java.time.ZoneId;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import com.carrental.config.ClockConfig;
import com.carrental.controller.HealthController;
import com.carrental.exception.GlobalExceptionHandler;
import com.carrental.web.RequestTraceFilter;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.junit.jupiter.api.io.TempDir;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@WebMvcTest(controllers = {HealthController.class, PlatformTestFixtures.TestEndpoints.class})
@AutoConfigureMockMvc
@Import({ClockConfig.class, GlobalExceptionHandler.class, RequestTraceFilter.class,
        PlatformTestFixtures.class, PlatformHttpTest.SliceSecurity.class})
class PlatformHttpTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private Clock applicationClock;

    @TestConfiguration(proxyBeanMethods = false)
    static class SliceSecurity {
        @Bean
        SecurityFilterChain p01RegressionOnlySecurityChain(HttpSecurity http) throws Exception {
            return http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(authorize -> authorize.anyRequest().permitAll())
                    .build();
        }
    }

    @Test
    void applicationContextStartsAndClockUsesConfiguredVietnamZone() {
        assertThat(applicationClock.getZone()).isEqualTo(ZoneId.of("Asia/Ho_Chi_Minh"));
    }

    @Test
    void clockUsesConfiguredZoneOverride() {
        new ApplicationContextRunner()
                .withUserConfiguration(ClockConfig.class)
                .withPropertyValues("app.time.zone=Asia/Bangkok")
                .run(context -> assertThat(context.getBean(Clock.class).getZone())
                        .isEqualTo(ZoneId.of("Asia/Bangkok")));
    }

    @Test
    void localProfileLoadsConfigurationFromOutsideClasspath(@TempDir Path localConfigDirectory) throws Exception {
        Files.writeString(localConfigDirectory.resolve("application-local.properties"),
                "app.time.zone=Asia/Bangkok\n");

        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(ClockConfig.class)
                .web(WebApplicationType.NONE)
                .run("--spring.config.location=classpath:/," + localConfigDirectory.toUri(),
                        "--spring.profiles.active=local")) {
            assertThat(context.getBean(Clock.class).getZone()).isEqualTo(ZoneId.of("Asia/Bangkok"));
        }
    }

    @Test
    void healthReturnsSuccessEnvelopeAndMatchingTraceId() throws Exception {
        MvcResult result = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(header().exists(RequestTraceFilter.HEADER_NAME))
                .andReturn();

        String traceId = result.getResponse().getHeader(RequestTraceFilter.HEADER_NAME);
        String body = result.getResponse().getContentAsString();
        assertThat(body)
                .contains("\"success\":true")
                .contains("\"code\":\"OK\"")
                .contains("\"errors\":[]")
                .contains("\"data\":{\"status\":\"UP\"}")
                .contains("\"traceId\":\"" + traceId + "\"");
    }

    @Test
    void validationFailureReturnsSafeFieldErrorWithoutRejectedValue() throws Exception {
        String rejectedValue = "private-input-value";
        MvcResult result = mockMvc.perform(post("/__test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + rejectedValue + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().exists(RequestTraceFilter.HEADER_NAME))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertJsonResponse(result);
        assertTraceMatchesHeader(result);
        String traceId = result.getResponse().getHeader(RequestTraceFilter.HEADER_NAME);
        assertThat(body.replace(traceId, "<UUID>"))
                .isEqualTo("{\"success\":false,\"code\":\"VALIDATION_ERROR\","
                        + "\"message\":\"Dữ liệu không hợp lệ\",\"data\":null,"
                        + "\"errors\":[{\"field\":\"name\",\"message\":\"Tối đa 3 ký tự\"}],"
                        + "\"traceId\":\"<UUID>\"}");
        assertThat(body)
                .contains("\"success\":false")
                .contains("\"code\":\"VALIDATION_ERROR\"")
                .contains("\"field\":\"name\"")
                .doesNotContain(rejectedValue)
                .doesNotContain("rejectedValue");
    }

    @Test
    void formBindingFailureDoesNotReturnRejectedValueOrFrameworkDiagnostics() throws Exception {
        String rejectedValue = "SENTINEL_PRIVATE_FIELD_REVIEW";
        MvcResult result = mockMvc.perform(post("/__test/validate-form")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .param("count", rejectedValue))
                .andExpect(status().isBadRequest())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertJsonResponse(result);
        assertTraceMatchesHeader(result);
        String traceId = result.getResponse().getHeader(RequestTraceFilter.HEADER_NAME);
        assertThat(body.replace(traceId, "<UUID>"))
                .isEqualTo("{\"success\":false,\"code\":\"VALIDATION_ERROR\","
                        + "\"message\":\"Dữ liệu không hợp lệ\",\"data\":null,"
                        + "\"errors\":[{\"field\":\"count\",\"message\":\"Giá trị không hợp lệ\"}],"
                        + "\"traceId\":\"<UUID>\"}");
        assertThat(body)
                .contains("\"code\":\"VALIDATION_ERROR\"")
                .contains("\"field\":\"count\"")
                .contains("\"message\":\"Giá trị không hợp lệ\"")
                .doesNotContain(rejectedValue)
                .doesNotContain("java.lang.")
                .doesNotContain("Failed to convert property value")
                .doesNotContain("rejectedValue");
    }

    @Test
    void malformedJsonReturnsSafeBadRequestEnvelope() throws Exception {
        MvcResult result = mockMvc.perform(post("/__test/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{malformed-private-input"))
                .andExpect(status().isBadRequest())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertJsonResponse(result);
        assertThat(body)
                .contains("\"code\":\"INVALID_REQUEST\"")
                .doesNotContain("malformed-private-input")
                .doesNotContain("HttpMessageNotReadableException");
        assertTraceMatchesHeader(result);
    }

    @Test
    void appExceptionKeepsItsHttpStatusAndCode() throws Exception {
        MvcResult result = mockMvc.perform(get("/__test/app-exception"))
                .andExpect(status().isNotFound())
                .andReturn();

        assertThat(result.getResponse().getContentAsString())
                .contains("\"code\":\"RESOURCE_NOT_FOUND\"")
                .contains("\"data\":null");
        assertJsonResponse(result);
        assertTraceMatchesHeader(result);
        assertThat(MDC.get(RequestTraceFilter.MDC_KEY)).isNull();
    }

    @Test
    void unexpectedExceptionReturnsSafeServerErrorAndClearsMdc() throws Exception {
        MvcResult result = mockMvc.perform(get("/__test/unexpected-exception"))
                .andExpect(status().isInternalServerError())
                .andReturn();

        String body = result.getResponse().getContentAsString();
        assertJsonResponse(result);
        assertThat(body)
                .contains("\"code\":\"INTERNAL_ERROR\"")
                .contains("Đã xảy ra lỗi hệ thống")
                .doesNotContain("private diagnostic detail")
                .doesNotContain("IllegalStateException");
        assertTraceMatchesHeader(result);
        assertThat(MDC.get(RequestTraceFilter.MDC_KEY)).isNull();
    }

    @Test
    void missingRouteReturnsNotFoundEnvelope() throws Exception {
        MvcResult result = mockMvc.perform(get("/does-not-exist"))
                .andExpect(status().isNotFound())
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).contains("\"code\":\"RESOURCE_NOT_FOUND\"");
        assertJsonResponse(result);
        assertTraceMatchesHeader(result);
    }

    @Test
    void unsupportedMethodKeeps405AndAllowHeader() throws Exception {
        MvcResult result = mockMvc.perform(post("/__test/method"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(header().exists(HttpHeaders.ALLOW))
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).contains("\"code\":\"METHOD_NOT_ALLOWED\"");
        assertJsonResponse(result);
        assertTraceMatchesHeader(result);
    }

    @Test
    void unsupportedContentTypeReturns415Envelope() throws Exception {
        MvcResult result = mockMvc.perform(post("/__test/validate")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content("private-input"))
                .andExpect(status().isUnsupportedMediaType())
                .andReturn();

        assertThat(result.getResponse().getContentAsString())
                .contains("\"code\":\"UNSUPPORTED_MEDIA_TYPE\"")
                .doesNotContain("private-input");
        assertJsonResponse(result);
        assertTraceMatchesHeader(result);
    }

    @Test
    void serverIgnoresClientTraceAndGeneratesDifferentIdForNextRequest() throws Exception {
        MvcResult first = mockMvc.perform(get("/api/health").header(RequestTraceFilter.HEADER_NAME, "client-value"))
                .andExpect(status().isOk())
                .andReturn();
        MvcResult second = mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andReturn();

        String firstId = first.getResponse().getHeader(RequestTraceFilter.HEADER_NAME);
        String secondId = second.getResponse().getHeader(RequestTraceFilter.HEADER_NAME);
        assertThat(firstId).isNotEqualTo("client-value");
        assertThat(firstId).isNotEqualTo(secondId);
        assertThat(UUID.fromString(firstId)).isNotNull();
        assertThat(UUID.fromString(secondId)).isNotNull();
        assertTraceMatchesHeader(first);
        assertTraceMatchesHeader(second);
        assertThat(MDC.get(RequestTraceFilter.MDC_KEY)).isNull();
    }

    private void assertTraceMatchesHeader(MvcResult result) throws Exception {
        String traceId = result.getResponse().getHeader(RequestTraceFilter.HEADER_NAME);
        assertThat(traceId).isNotBlank();
        assertThat(result.getResponse().getContentAsString()).contains("\"traceId\":\"" + traceId + "\"");
    }

    private void assertJsonResponse(MvcResult result) {
        assertThat(result.getResponse().getContentType()).startsWith(MediaType.APPLICATION_JSON_VALUE);
    }
}
