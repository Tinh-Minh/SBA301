package com.carrental.support;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

/** Đồng hồ cho test, có thể đặt/tua thời gian (ví dụ để đơn quá hạn hoặc đến giờ nhận xe). */
public class MutableClock extends Clock {

    private final ZoneId zone;
    private Instant instant;

    public MutableClock(LocalDateTime start, ZoneId zone) {
        this.zone = zone;
        this.instant = start.atZone(zone).toInstant();
    }

    public void setTo(LocalDateTime time) {
        this.instant = time.atZone(zone).toInstant();
    }

    public void advance(Duration duration) {
        this.instant = instant.plus(duration);
    }

    @Override
    public ZoneId getZone() {
        return zone;
    }

    @Override
    public Clock withZone(ZoneId zone) {
        MutableClock copy = new MutableClock(LocalDateTime.ofInstant(instant, this.zone), zone);
        copy.instant = this.instant;
        return copy;
    }

    @Override
    public Instant instant() {
        return instant;
    }
}
