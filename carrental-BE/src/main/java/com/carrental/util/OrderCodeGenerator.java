package com.carrental.util;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Sinh mã đơn thuê dạng RO + yyMMdd + 6 ký tự ngẫu nhiên (bỏ các ký tự dễ nhầm 0, O, 1, I).
 * Mỗi ngày có 32^6 (khoảng 1 tỉ) mã; trường hợp trùng hiếm hoi do ràng buộc unique của
 * cột rental_orders.order_code chặn và GlobalExceptionHandler trả 409.
 */
public final class OrderCodeGenerator {

    private static final DateTimeFormatter CODE_DATE = DateTimeFormatter.ofPattern("yyMMdd");
    private static final String CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final int RANDOM_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private OrderCodeGenerator() {
    }

    public static String generate(LocalDateTime now) {
        StringBuilder sb = new StringBuilder("RO").append(now.format(CODE_DATE));
        for (int i = 0; i < RANDOM_LENGTH; i++) {
            sb.append(CODE_CHARS.charAt(RANDOM.nextInt(CODE_CHARS.length())));
        }
        return sb.toString();
    }
}
