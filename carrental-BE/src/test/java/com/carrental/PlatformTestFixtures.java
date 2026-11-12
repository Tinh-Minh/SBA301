package com.carrental;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@TestConfiguration(proxyBeanMethods = false)
@Import(PlatformTestFixtures.TestEndpoints.class)
class PlatformTestFixtures {

    @RestController
    @RequestMapping(path = "/__test", produces = MediaType.APPLICATION_JSON_VALUE)
    static class TestEndpoints {

        @PostMapping(path = "/validate", consumes = MediaType.APPLICATION_JSON_VALUE)
        TestPayload validate(@Valid @RequestBody TestPayload payload) {
            return payload;
        }

        @PostMapping(path = "/validate-form", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
        FormPayload validateForm(@Valid @ModelAttribute FormPayload payload) {
            return payload;
        }

        @GetMapping("/method")
        String methodOnlyForGet() {
            return "ok";
        }

        @GetMapping("/app-exception")
        void appException() {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        @GetMapping("/unexpected-exception")
        void unexpectedException() {
            throw new IllegalStateException("private diagnostic detail");
        }
    }

    record TestPayload(
            @NotBlank(message = "Không được để trống")
            @Size(max = 3, message = "Tối đa 3 ký tự")
            String name) {
    }

    static class FormPayload {

        @Min(value = 1, message = "Phải lớn hơn 0")
        private Integer count;

        public Integer getCount() {
            return count;
        }

        public void setCount(Integer count) {
            this.count = count;
        }
    }
}
