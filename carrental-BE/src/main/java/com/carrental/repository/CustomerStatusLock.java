package com.carrental.repository;

import com.carrental.config.CustomerProperties;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** PostgreSQL transaction-scoped serialization for all customer status commands. */
@Component
public class CustomerStatusLock {

    // The hexadecimal key spells "SBA301CS" and is reserved for sba301:function1:customer-status.
    // PostgreSQL releases this advisory lock automatically at transaction completion.
    public static final long STATUS_NAMESPACE_KEY = 0x5342413330314353L;
    private static final String POSTGRES_LOCK_NOT_AVAILABLE = "55P03";
    private final JdbcTemplate jdbc;
    private final CustomerProperties properties;

    public CustomerStatusLock(JdbcTemplate jdbc, CustomerProperties properties) {
        this.jdbc = jdbc;
        this.properties = properties;
    }

    public void acquire() {
        if (!TransactionSynchronizationManager.isActualTransactionActive()) {
            throw new IllegalStateException("Customer status lock requires an active database transaction");
        }
        jdbc.execute((ConnectionCallback<Void>) connection -> {
            try (PreparedStatement timeout = connection.prepareStatement("select set_config('lock_timeout', ?, true)")) {
                timeout.setString(1, properties.getStatusLockTimeoutMs() + "ms");
                timeout.execute();
            }
            try (PreparedStatement lock = connection.prepareStatement("select pg_advisory_xact_lock(?)")) {
                lock.setLong(1, STATUS_NAMESPACE_KEY);
                try {
                    lock.execute();
                } catch (SQLException exception) {
                    if (isLockUnavailable(exception)) {
                        throw new CannotAcquireLockException("Customer status advisory lock is unavailable", exception);
                    }
                    throw exception;
                }
            }
            return null;
        });
    }

    static boolean isLockUnavailable(SQLException exception) {
        return exception != null && POSTGRES_LOCK_NOT_AVAILABLE.equals(exception.getSQLState());
    }
}
