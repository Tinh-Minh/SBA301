package com.carrental.util;

import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class OrderCodeGeneratorTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 1, 8, 0);

    @Test
    void codeHasPrefixDateAndSixSafeCharacters() {
        String code = OrderCodeGenerator.generate(NOW);

        // RO + yyMMdd + 6 ký tự, không có các ký tự dễ nhầm 0, O, 1, I
        assertThat(code).matches("RO261101[A-HJ-NP-Z2-9]{6}");
        assertThat(code).hasSize(14);
    }

    @Test
    void codesAreRandomWithinTheSameDay() {
        Set<String> codes = new HashSet<>();
        for (int i = 0; i < 1000; i++) {
            codes.add(OrderCodeGenerator.generate(NOW));
        }
        // 32^6 khả năng mỗi ngày: 1000 mã liên tiếp gần như chắc chắn không trùng
        assertThat(codes).hasSizeGreaterThan(995);
    }
}
