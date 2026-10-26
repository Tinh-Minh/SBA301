package com.carrental.config;

import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.ResolverStyle;
import java.time.temporal.ChronoField;
import java.util.List;
import org.springframework.boot.jackson.autoconfigure.JsonMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverters;
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import tools.jackson.core.StreamReadFeature;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.MapperFeature;
import tools.jackson.databind.cfg.CoercionAction;
import tools.jackson.databind.cfg.EnumFeature;
import tools.jackson.databind.cfg.CoercionInputShape;
import tools.jackson.databind.ext.javatime.deser.LocalDateTimeDeserializer;
import tools.jackson.databind.module.SimpleModule;
import tools.jackson.databind.type.LogicalType;

@Configuration(proxyBeanMethods = false)
public class ExactDecimalJsonMapperConfiguration implements WebMvcConfigurer {
    @Bean
    JsonMapperBuilderCustomizer exactDecimalJsonMapperCustomizer() {
        return builder -> builder.enable(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);
    }

    @Override
    public void configureMessageConverters(HttpMessageConverters.ServerBuilder converters) {
        var dateTime = new DateTimeFormatterBuilder().appendPattern("uuuu-MM-dd'T'HH:mm:ss")
                .optionalStart().appendFraction(ChronoField.NANO_OF_SECOND, 1, 6, true).optionalEnd()
                .toFormatter().withResolverStyle(ResolverStyle.STRICT);
        var dates = new SimpleModule("voucher-date-time");
        dates.addDeserializer(LocalDateTime.class, new LocalDateTimeDeserializer(dateTime));
        converters.configureMessageConverters(converter -> {
            if (!(converter instanceof JacksonJsonHttpMessageConverter json)) return;
            // Keep voucher's existing strict JSON contract without custom parsing in the DTOs.
            // Other endpoints retain their existing mapper and coercion rules.
            var strict = json.getMapper().rebuild().addModule(dates)
                    .enable(StreamReadFeature.STRICT_DUPLICATE_DETECTION)
                    .enable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)
                    .enable(EnumFeature.FAIL_ON_NUMBERS_FOR_ENUMS)
                    .disable(DeserializationFeature.ACCEPT_FLOAT_AS_INT)
                    .disable(MapperFeature.ALLOW_COERCION_OF_SCALARS)
                    .withCoercionConfig(LogicalType.Textual, c -> c
                            .setCoercion(CoercionInputShape.Integer, CoercionAction.Fail)
                            .setCoercion(CoercionInputShape.Float, CoercionAction.Fail)
                            .setCoercion(CoercionInputShape.Boolean, CoercionAction.Fail))
                    .build();
            for (Class<?> type : List.of(CreateVoucherRequest.class, UpdateVoucherAdminRequest.class, ChangeVoucherStatusRequest.class)) {
                json.registerMappersForType(type, mappers -> mappers.put(MediaType.APPLICATION_JSON, strict));
            }
        });
    }
}
