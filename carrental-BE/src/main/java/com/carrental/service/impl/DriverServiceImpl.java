package com.carrental.service.impl;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.driver.ChangeDriverStatusRequest;
import com.carrental.dto.request.driver.DriverListQuery;
import com.carrental.dto.response.DriverEligibilityReasonCode;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.Driver;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.repository.DriverRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.DriverChangeLogger;
import com.carrental.service.DriverEligibilityPolicy;
import com.carrental.service.DriverEligibilityService;
import com.carrental.service.DriverService;
import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import java.util.function.Function;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DriverServiceImpl implements DriverService {

    private static final String CUSTOMER_UNIQUE_CONSTRAINT = "drivers_customer_id_key";

    private final DriverRepository drivers;
    private final CustomerRepository customers;
    private final CustomerStatusLock statusLock;
    private final DriverEligibilityService eligibility;
    private final DriverEligibilityPolicy eligibilityPolicy;
    private final DriverChangeLogger changeLogger;
    private final CustomerProperties properties;
    private final Clock clock;

    public DriverServiceImpl(DriverRepository drivers, CustomerRepository customers,
            CustomerStatusLock statusLock, DriverEligibilityService eligibility,
            DriverEligibilityPolicy eligibilityPolicy, DriverChangeLogger changeLogger,
            CustomerProperties properties, Clock clock) {
        this.drivers = drivers;
        this.customers = customers;
        this.statusLock = statusLock;
        this.eligibility = eligibility;
        this.eligibilityPolicy = eligibilityPolicy;
        this.changeLogger = changeLogger;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public DriverResponse createForMe(CurrentAccount account) {
        requirePrincipal(account);
        if (account.role() != Role.CUSTOMER && account.role() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        try {
            // Same global→customer ordering as P04 status and P06 review commands.
            statusLock.acquire();
            Customer owner = customers.findByIdForUpdate(account.customerId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
            requireMatchingActiveAccount(owner, account);
            if (drivers.existsByCustomer_Id(owner.getId())) {
                throw new AppException(ErrorCode.DRIVER_PROFILE_ALREADY_EXISTS);
            }
            Driver driver = new Driver();
            driver.setCustomer(owner);
            driver.setStatus(DriverStatus.PENDING);
            Driver saved = drivers.saveAndFlush(driver);
            changeLogger.created(owner.getId(), owner.getId(), saved.getId());
            return DriverResponse.from(saved);
        } catch (DataIntegrityViolationException exception) {
            if (hasExactDriverCustomerUniqueViolation(exception)) {
                changeLogger.failure("driver-profile-unique-conflict", ErrorCode.DRIVER_PROFILE_ALREADY_EXISTS,
                        account.customerId(), account.customerId(), null,
                        exception.getClass().getSimpleName(), CUSTOMER_UNIQUE_CONSTRAINT);
                throw new AppException(ErrorCode.DRIVER_PROFILE_ALREADY_EXISTS, exception);
            }
            changeLogger.failure("driver-create-integrity-failure", ErrorCode.INTERNAL_ERROR,
                    account.customerId(), account.customerId(), null, exception.getClass().getSimpleName(), null);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("driver-create-database-failure", account.customerId(), account.customerId(), null,
                    exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public DriverResponse getMe(CurrentAccount account) {
        Customer actor = requireActiveAccount(account);
        Driver driver = drivers.findByCustomer_Id(actor.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return DriverResponse.from(driver);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public DriverResponse getById(CurrentAccount account, long driverId) {
        requirePositiveId(driverId);
        Customer actor = requireActiveAccount(account);
        Driver driver = actor.getRole() == Role.ADMIN
                ? drivers.findById(driverId).orElseThrow(() -> notFound())
                : drivers.findByIdAndCustomer_Id(driverId, actor.getId()).orElseThrow(() -> notFound());
        return DriverResponse.from(driver);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<DriverResponse> list(CurrentAccount account, DriverListQuery query) {
        Customer actor = requireActiveAccount(account);
        if (actor.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
        Objects.requireNonNull(query);
        Specification<Driver> specification = (root, criteria, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (query.status() != null) predicates.add(builder.equal(root.get("status"), query.status()));
            if (query.customerId() != null) predicates.add(builder.equal(root.get("customer").get("id"), query.customerId()));
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        Page<Driver> page = drivers.findAll(specification, query.pageable());
        return new PageResponse<>(page.getContent().stream().map(DriverResponse::from).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DriverResponse changeStatus(CurrentAccount actor, long driverId, ChangeDriverStatusRequest request) {
        requirePositiveId(driverId);
        StatusCommand command = validateStatusCommand(request);
        requirePrincipal(actor);
        if (actor.role() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);

        Long discoveredOwnerId = null;
        try {
            statusLock.acquire();
            Customer actorRow = customers.findByIdForUpdate(actor.customerId())
                    .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
            if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
            if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);

            discoveredOwnerId = drivers.findCustomerIdByDriverId(driverId).orElseThrow(() -> notFound());
            Customer owner = discoveredOwnerId == actorRow.getId()
                    ? actorRow
                    : customers.findByIdForUpdate(discoveredOwnerId).orElseThrow(() -> notFound());
            Driver driver = drivers.findByIdForUpdate(driverId).orElseThrow(() -> notFound());
            if (driver.getCustomer().getId() == null || !driver.getCustomer().getId().equals(discoveredOwnerId)) {
                throw notFound();
            }
            // U-15 applies before the transition switch, including same-state requests.
            if (actorRow.getId().equals(owner.getId())) {
                throw new AppException(ErrorCode.DRIVER_SELF_STATUS_CHANGE_FORBIDDEN);
            }

            LocalDate evaluatedOn = LocalDate.now(clock);
            DriverStatus previous = driver.getStatus();
            switch (previous) {
                case PENDING -> {
                    if (command.status() != DriverStatus.ACTIVE) throw invalidTransition();
                    requireActivationEligible(owner, evaluatedOn);
                    driver.setStatus(DriverStatus.ACTIVE);
                }
                case ACTIVE -> {
                    if (command.status() == DriverStatus.ACTIVE) {
                        requireActivationEligible(owner, evaluatedOn);
                    } else {
                        driver.setStatus(DriverStatus.SUSPENDED);
                    }
                }
                case SUSPENDED -> {
                    if (command.status() == DriverStatus.ACTIVE) {
                        requireActivationEligible(owner, evaluatedOn);
                        driver.setStatus(DriverStatus.ACTIVE);
                    }
                    // SUSPENDED→SUSPENDED is a no-op with no audit/success event.
                }
            }

            if (driver.getStatus() != previous) {
                drivers.flush();
                changeLogger.changed(actorRow.getId(), owner.getId(), driver.getId(), previous,
                        driver.getStatus(), command.reasonProvided());
            }
            return DriverResponse.from(driver);
        } catch (DataAccessException exception) {
            logDatabaseFailure("driver-status-database-failure", actor.customerId(), discoveredOwnerId,
                    driverId, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public DriverEligibilityResponse getMyEligibility(CurrentAccount account) {
        Customer actor = requireActiveAccount(account);
        return eligibility.evaluateForCustomer(actor.getId());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public DriverEligibilityResponse getEligibility(CurrentAccount account, long driverId) {
        requirePositiveId(driverId);
        Customer actor = requireActiveAccount(account);
        Driver driver = actor.getRole() == Role.ADMIN
                ? drivers.findById(driverId).orElseThrow(() -> notFound())
                : drivers.findByIdAndCustomer_Id(driverId, actor.getId()).orElseThrow(() -> notFound());
        return eligibility.evaluateForCustomer(driver.getCustomer().getId());
    }

    private void requireActivationEligible(Customer owner, LocalDate evaluatedOn) {
        DriverEligibilityResponse current = eligibility.evaluateForCustomer(owner.getId(), evaluatedOn);
        DriverEligibilityReasonCode failure = eligibilityPolicy.activationFailure(
                current.accountStatus(), current.kycStatus(), current.hasValidDriverLicense());
        if (failure != null) throw new AppException(ErrorCode.DRIVER_NOT_ELIGIBLE);
    }

    private StatusCommand validateStatusCommand(ChangeDriverStatusRequest request) {
        if (request == null || !request.statusWasProvided() || request.getStatus() == null
                || request.getStatus() == DriverStatus.PENDING) throw new AppException(ErrorCode.INVALID_REQUEST);
        String reason = request.getReason();
        if (request.getStatus() == DriverStatus.ACTIVE) {
            if (reason != null) throw new AppException(ErrorCode.INVALID_REQUEST);
            return new StatusCommand(DriverStatus.ACTIVE, request.reasonWasProvided());
        }
        if (!request.reasonWasProvided() || reason == null || reason.strip().isBlank()) {
            throw fieldError("reason", "Lý do không được để trống");
        }
        reason = reason.strip();
        if (reason.length() > properties.getStatusReasonMaxLength()) {
            throw fieldError("reason", "Lý do vượt quá giới hạn cho phép");
        }
        // The free-text reason is validated and deliberately discarded: the leader schema has no reason column.
        return new StatusCommand(DriverStatus.SUSPENDED, true);
    }

    private Customer requireActiveAccount(CurrentAccount account) {
        requirePrincipal(account);
        Customer row = customers.findById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        requireMatchingActiveAccount(row, account);
        return row;
    }

    private void requireMatchingActiveAccount(Customer row, CurrentAccount account) {
        if (row.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (row.getRole() != account.role()) throw new AppException(ErrorCode.ACCESS_DENIED);
        if (row.getRole() != Role.CUSTOMER && row.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private void requirePrincipal(CurrentAccount account) {
        if (account == null || account.customerId() <= 0 || account.role() == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private AppException fieldError(String field, String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR, List.of(new FieldErrorResponse(field, message)));
    }

    private AppException invalidTransition() {
        return new AppException(ErrorCode.INVALID_DRIVER_STATUS_TRANSITION);
    }

    private AppException notFound() {
        return new AppException(ErrorCode.RESOURCE_NOT_FOUND);
    }

    private void logDatabaseFailure(String category, long actorId, Long ownerId, Long driverId,
            DataAccessException exception) {
        ErrorCode code = exception instanceof PessimisticLockingFailureException
                || exception instanceof DataAccessResourceFailureException
                ? ErrorCode.DEPENDENCY_UNAVAILABLE : ErrorCode.INTERNAL_ERROR;
        changeLogger.failure(category, code, actorId, ownerId, driverId,
                exception.getClass().getSimpleName(), null);
    }

    private boolean hasExactDriverCustomerUniqueViolation(Throwable failure) {
        boolean exactConstraint = false;
        boolean uniqueViolation = false;
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof ConstraintViolationException violation) {
                exactConstraint |= CUSTOMER_UNIQUE_CONSTRAINT.equals(violation.getConstraintName());
                SQLException sql = violation.getSQLException();
                uniqueViolation |= hasUniqueSqlState(sql);
            }
            if (current instanceof SQLException sql) uniqueViolation |= hasUniqueSqlState(sql);
        }
        return exactConstraint && uniqueViolation;
    }

    private boolean hasUniqueSqlState(SQLException sql) {
        for (SQLException current = sql; current != null; current = current.getNextException()) {
            if ("23505".equals(current.getSQLState())) return true;
        }
        return false;
    }

    private record StatusCommand(DriverStatus status, boolean reasonProvided) { }
}
