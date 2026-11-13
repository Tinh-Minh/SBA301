package com.carrental.service;

import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

@Component
public class MailRateLimiter {

    public static final Duration WINDOW_DURATION = Duration.ofMinutes(10);
    public static final Duration EMAIL_COOLDOWN = Duration.ofSeconds(60);
    public static final int MAX_EMAIL_ATTEMPTS = 3;

    public static final Duration IP_COOLDOWN = Duration.ofSeconds(5);
    public static final int MAX_IP_ATTEMPTS = 10;

    private final Clock clock;
    private final Map<String, AttemptTracker> emailTrackers = new ConcurrentHashMap<>();
    private final Map<String, AttemptTracker> ipTrackers = new ConcurrentHashMap<>();

    public MailRateLimiter(Clock clock) {
        this.clock = clock;
    }

    public void checkAndRecord(String email, String ip) {
        Instant now = clock.instant();

        // 1. Kiểm tra giới hạn theo Email
        if (email != null && !email.isBlank()) {
            String normalizedEmail = email.trim().toLowerCase();
            AttemptTracker emailTracker = emailTrackers.computeIfAbsent(normalizedEmail, k -> new AttemptTracker());
            synchronized (emailTracker) {
                emailTracker.prune(now, WINDOW_DURATION);

                if (emailTracker.lastAttempt != null && now.isBefore(emailTracker.lastAttempt.plus(EMAIL_COOLDOWN))) {
                    long remainingSeconds = Duration.between(now, emailTracker.lastAttempt.plus(EMAIL_COOLDOWN)).toSeconds();
                    throw new AppException(ErrorCode.TOO_MANY_REQUESTS,
                            "Vui lòng chờ " + Math.max(1, remainingSeconds) + " giây trước khi gửi lại email xác thực");
                }

                if (emailTracker.attempts.size() >= MAX_EMAIL_ATTEMPTS) {
                    throw new AppException(ErrorCode.TOO_MANY_REQUESTS,
                            "Bạn đã vượt quá giới hạn " + MAX_EMAIL_ATTEMPTS + " lần gửi mã xác thực trong 10 phút. Vui lòng thử lại sau.");
                }

                emailTracker.record(now);
            }
        }

        // 2. Kiểm tra giới hạn theo IP
        if (ip != null && !ip.isBlank()) {
            String normalizedIp = ip.trim();
            AttemptTracker ipTracker = ipTrackers.computeIfAbsent(normalizedIp, k -> new AttemptTracker());
            synchronized (ipTracker) {
                ipTracker.prune(now, WINDOW_DURATION);

                if (ipTracker.lastAttempt != null && now.isBefore(ipTracker.lastAttempt.plus(IP_COOLDOWN))) {
                    throw new AppException(ErrorCode.TOO_MANY_REQUESTS,
                            "Thao tác quá nhanh. Vui lòng chờ vài giây trước khi thử lại");
                }

                if (ipTracker.attempts.size() >= MAX_IP_ATTEMPTS) {
                    throw new AppException(ErrorCode.TOO_MANY_REQUESTS,
                            "Địa chỉ IP của bạn đã gửi quá nhiều yêu cầu xác thực. Vui lòng thử lại sau.");
                }

                ipTracker.record(now);
            }
        }
    }

    public void reset() {
        emailTrackers.clear();
        ipTrackers.clear();
    }

    private static class AttemptTracker {
        Instant lastAttempt;
        final Deque<Instant> attempts = new ArrayDeque<>();

        void prune(Instant now, Duration window) {
            Instant threshold = now.minus(window);
            while (!attempts.isEmpty() && attempts.peekFirst().isBefore(threshold)) {
                attempts.pollFirst();
            }
        }

        void record(Instant now) {
            lastAttempt = now;
            attempts.addLast(now);
        }
    }
}
