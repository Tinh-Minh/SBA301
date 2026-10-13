package com.carrental.config;

import com.carrental.service.impl.HeaderCurrentUserServiceImpl;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.parameters.HeaderParameter;
import org.springdoc.core.customizers.OperationCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * TẠM THỜI: thêm ô nhập header X-User-Id vào mọi API trên Swagger UI để test Function 3
 * khi chưa có JWT. Xóa cùng lúc với HeaderCurrentUserServiceImpl khi Function 1 xong.
 */
@Configuration
public class TempSwaggerHeaderConfig {

    @Bean
    public OperationCustomizer userIdHeaderCustomizer() {
        return (operation, handlerMethod) -> operation.addParametersItem(new HeaderParameter()
                .name(HeaderCurrentUserServiceImpl.USER_ID_HEADER)
                .description("TẠM THỜI: id customer đang đăng nhập (thay cho JWT)")
                .required(false)
                .schema(new StringSchema()));
    }
}
