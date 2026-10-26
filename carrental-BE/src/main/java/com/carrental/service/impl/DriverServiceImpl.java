package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.fieldError;
import static com.carrental.util.RequestChecks.notFound;
import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.driver.ChangeDriverStatusRequest;
import com.carrental.dto.request.driver.DriverListQuery;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.Driver;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DriverRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.DriverEligibilityService;
import com.carrental.service.DriverService;
import com.carrental.util.RequestChecks;
import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class DriverServiceImpl implements DriverService {

    private final DriverRepository drivers;
    private final CustomerRepository customers;
    private final DriverEligibilityService eligibility;
    private final CustomerProperties properties;
    private final Clock clock;

    public DriverServiceImpl(DriverRepository drivers, CustomerRepository customers,
            DriverEligibilityService eligibility, CustomerProperties properties, Clock clock) {
        this.drivers = drivers;
        this.customers = customers;
        this.eligibility = eligibility;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public DriverResponse createForMe(CurrentAccount account) {
        Customer owner = requireActiveAccount(account);
        if (drivers.existsByCustomerId(owner.getId())) throw new AppException(ErrorCode.DRIVER_PROFILE_ALREADY_EXISTS);
        Driver saved = drivers.saveAndFlush(newDriver(owner));
        log.info("driver-create ownerId={} driverId={}", owner.getId(), saved.getId());
        return DriverResponse.from(saved);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public DriverResponse getMe(CurrentAccount account) {
        Customer actor = requireActiveAccount(account);
        Driver driver = drivers.findByCustomerId(actor.getId())
                .orElseThrow(RequestChecks::notFound);
        return DriverResponse.from(driver);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public DriverResponse getById(CurrentAccount account, long driverId) {
        return DriverResponse.from(findAccessibleDriver(account, driverId));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<DriverResponse> list(CurrentAccount account, DriverListQuery query) {
        requireActiveAccount(account);
        Objects.requireNonNull(query);
        Specification<Driver> specification = (root, criteria, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (query.status() != null) predicates.add(builder.equal(root.get("status"), query.status()));
            if (query.customerId() != null) predicates.add(builder.equal(root.get("customer").get("id"), query.customerId()));
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
        Page<Driver> page = drivers.findAll(specification, query.pageable());
        return PageResponse.from(page.map(DriverResponse::from));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DriverResponse changeStatus(CurrentAccount actor, long driverId, ChangeDriverStatusRequest request) {
        requirePrincipal(actor);
        if (actor.role() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
        requirePositiveId(driverId);
        StatusCommand command = validateStatusCommand(request);
        Driver driver = drivers.findWithLockById(driverId).orElseThrow(RequestChecks::notFound);
        // Coordinate eligibility with document reviews and changes to the owner's account status.
        Customer owner = customers.findWithLockById(driver.getCustomer().getId()).orElseThrow(RequestChecks::notFound);
        Customer actorRow = requireActiveAccount(actor);
        if (actorRow.getId().equals(owner.getId())) throw new AppException(ErrorCode.DRIVER_SELF_STATUS_CHANGE_FORBIDDEN);
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
            log.info("driver-change actorId={} ownerId={} driverId={} {} -> {} reasonProvided={}", actorRow.getId(), owner.getId(), driver.getId(), previous, driver.getStatus(), command.reasonProvided());
        }
        return DriverResponse.from(driver);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public DriverEligibilityResponse getMyEligibility(CurrentAccount account) {
        Customer actor = requireActiveAccount(account);
        return eligibility.evaluateForCustomer(actor.getId());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public DriverEligibilityResponse getEligibility(CurrentAccount account, long driverId) {
        Driver driver = findAccessibleDriver(account, driverId);
        return eligibility.evaluateForCustomer(driver.getCustomer().getId());
    }

    private Driver findAccessibleDriver(CurrentAccount account, long driverId) {
        requirePositiveId(driverId);
        Customer actor = requireActiveAccount(account);
        return actor.getRole() == Role.ADMIN
                ? drivers.findById(driverId).orElseThrow(RequestChecks::notFound)
                : drivers.findByIdAndCustomerId(driverId, actor.getId()).orElseThrow(RequestChecks::notFound);
    }

    private void requireActivationEligible(Customer owner, LocalDate evaluatedOn) {
        DriverEligibilityResponse current = eligibility.evaluateForCustomer(owner.getId(), evaluatedOn);
        if (DriverEligibilityService.activationFailure(
                current.accountStatus(), current.kycStatus(), current.hasValidDriverLicense()) != null) {
            throw new AppException(ErrorCode.DRIVER_NOT_ELIGIBLE);
        }
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

    private static Driver newDriver(Customer owner) {
        Driver driver = new Driver();
        driver.setCustomer(owner);
        driver.setStatus(DriverStatus.PENDING);
        return driver;
    }

    private Customer requireActiveAccount(CurrentAccount account) {
        requirePrincipal(account);
        Customer row = customers.findById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (row.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (row.getRole() != account.role() || (row.getRole() != Role.CUSTOMER && row.getRole() != Role.ADMIN)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        return row;
    }

    private AppException invalidTransition() {
        return new AppException(ErrorCode.INVALID_DRIVER_STATUS_TRANSITION);
    }

    private record StatusCommand(DriverStatus status, boolean reasonProvided) { }
}
