package com.carrental.security;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Chống dò mật khẩu: đăng nhập sai {@link #MAX_FAILURES} lần trong {@link #WINDOW}
 * thì tài khoản (theo email) bị khoá đăng nhập tạm thời trong {@link #LOCK_DURATION}.
 * Lưu trong bộ nhớ - đủ cho một instance; nhiều instance cần chuyển sang Redis/DB.
 */
public class LoginAttemptGuard {

    public static final int MAX_FAILURES = 5;
    public static final Duration WINDOW = Duration.ofMinutes(15);
    public static final Duration LOCK_DURATION = Duration.ofMinutes(15);

    private record Attempt(int failures, Instant firstFailureAt, Instant lockedUntil) {}

    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();

    public boolean isLocked(String email) {
        Attempt attempt = attempts.get(key(email));
        return attempt != null && attempt.lockedUntil() != null && Instant.now().isBefore(attempt.lockedUntil());
    }

    public void recordFailure(String email) {
        Instant now = Instant.now();
        attempts.compute(key(email), (k, current) -> {
            if (current == null || now.isAfter(current.firstFailureAt().plus(WINDOW))
                    || (current.lockedUntil() != null && now.isAfter(current.lockedUntil()))) {
                return new Attempt(1, now, null);
            }
            int failures = current.failures() + 1;
            Instant lockedUntil = failures >= MAX_FAILURES ? now.plus(LOCK_DURATION) : null;
            return new Attempt(failures, current.firstFailureAt(), lockedUntil);
        });
    }

    public void recordSuccess(String email) {
        attempts.remove(key(email));
    }

    private static String key(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }
}
