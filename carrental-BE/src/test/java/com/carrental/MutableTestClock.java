package com.carrental;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.concurrent.atomic.AtomicReference;

final class MutableTestClock extends Clock {
    private final AtomicReference<Instant> instant;
    private final ZoneId zone;

    MutableTestClock(Instant initial, ZoneId zone) {
        this(new AtomicReference<>(initial), zone);
    }

    private MutableTestClock(AtomicReference<Instant> instant, ZoneId zone) {
        this.instant = instant;
        this.zone = zone;
    }

    void set(Instant value) { instant.set(value); }

    @Override public ZoneId getZone() { return zone; }
    @Override public Clock withZone(ZoneId zone) { return new MutableTestClock(instant, zone); }
    @Override public Instant instant() { return instant.get(); }
}
