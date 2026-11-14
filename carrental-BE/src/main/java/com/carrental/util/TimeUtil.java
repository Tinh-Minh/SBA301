package com.carrental.util;

import java.time.LocalDateTime;
import java.time.ZoneId;

public final class TimeUtil {
    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private TimeUtil() {}

    public static LocalDateTime nowVn() {
        return LocalDateTime.now(VN);
    }
}
