package com.carrental.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.sql.SQLException;
import org.junit.jupiter.api.Test;

class CustomerStatusLockTest {

    @Test
    void classifiesOnlyPostgresLockNotAvailableSqlState() {
        assertThat(CustomerStatusLock.isLockUnavailable(new SQLException("synthetic lock", "55P03"))).isTrue();
        assertThat(CustomerStatusLock.isLockUnavailable(new SQLException("synthetic constraint", "23514"))).isFalse();
        assertThat(CustomerStatusLock.isLockUnavailable(new SQLException("synthetic serialization", "40001"))).isFalse();
        assertThat(CustomerStatusLock.isLockUnavailable(new SQLException("no state"))).isFalse();
        assertThat(CustomerStatusLock.isLockUnavailable(null)).isFalse();
    }
}
