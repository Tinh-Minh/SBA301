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
import com.carrental.mapper.DriverMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DriverRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.ActionLogService;
import com.carrental.service.DriverEligibilityService;
import com.carrental.service.DriverService;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DriverServiceImpl implements DriverService {

    private final DriverRepository drivers;
    private final CustomerRepository customers;
    private final DriverEligibilityService eligibility;
    private final ActionLogService actionLogService;
    private final CustomerProperties properties;
    private final Clock clock;

    public DriverServiceImpl(DriverRepository drivers, CustomerRepository customers,
            DriverEligibilityService eligibility, ActionLogService actionLogService,
            CustomerProperties properties, Clock clock) {
        this.drivers = drivers;
        this.customers = customers;
        this.eligibility = eligibility;
        this.actionLogService = actionLogService;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public DriverResponse createForMe(CurrentAccount account) {
        Customer owner = requireActiveAccount(account);
        if (drivers.existsByCustomerId(owner.getId())) throw new AppException(ErrorCode.DRIVER_PROFILE_ALREADY_EXISTS);
        Driver saved = drivers.saveAndFlush(DriverMapper.toNewEntity(owner));
        actionLogService.driverCreated(owner.getId(), owner.getId(), saved.getId());
        return DriverMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public DriverResponse getMe(CurrentAccount account) {
        Customer actor = requireActiveAccount(account);
        Driver driver = drivers.findByCustomerId(actor.getId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return DriverMapper.toResponse(driver);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public DriverResponse getById(CurrentAccount account, long driverId) {
        requirePositiveId(driverId);
        Customer actor = requireActiveAccount(account);
        Driver driver = actor.getRole() == Role.ADMIN
                ? drivers.findById(driverId).orElseThrow(() -> notFound())
                : drivers.findByIdAndCustomerId(driverId, actor.getId()).orElseThrow(() -> notFound());
        return DriverMapper.toResponse(driver);
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
        return new PageResponse<>(page.getContent().stream().map(DriverMapper::toResponse).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public DriverResponse changeStatus(CurrentAccount actor, long driverId, ChangeDriverStatusRequest request) {
        requirePrincipal(actor);
        if (actor.role() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
        requirePositiveId(driverId);
        StatusCommand command = validateStatusCommand(request);
        Driver driver = drivers.findWithLockById(driverId).orElseThrow(this::notFound);
        // Coordinate eligibility with document reviews and changes to the owner's account status.
        Customer owner = customers.findWithLockById(driver.getCustomer().getId()).orElseThrow(this::notFound);
        Customer actorRow = requireActiveAccount(actor);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);
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
            actionLogService.driverChanged(actorRow.getId(), owner.getId(), driver.getId(), previous,
                    driver.getStatus(), command.reasonProvided());
        }
        return DriverMapper.toResponse(driver);
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
                : drivers.findByIdAndCustomerId(driverId, actor.getId()).orElseThrow(() -> notFound());
        return eligibility.evaluateForCustomer(driver.getCustomer().getId());
    }

    private void requireActivationEligible(Customer owner, LocalDate evaluatedOn) {
        DriverEligibilityResponse current = eligibility.evaluateForCustomer(owner.getId(), evaluatedOn);
        if (activationFailure(current.accountStatus(), current.kycStatus(), current.hasValidDriverLicense()) != null)
            throw new AppException(ErrorCode.DRIVER_NOT_ELIGIBLE);
    }

    static DriverEligibilityReasonCode activationFailure(CustomerStatus accountStatus, KycStatus currentKyc,
            boolean hasValidDriverLicense) {
        if (accountStatus != CustomerStatus.ACTIVE) return DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE;
        if (currentKyc != KycStatus.VERIFIED) return DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED;
        if (!hasValidDriverLicense) return DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED;
        return null;
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

    private record StatusCommand(DriverStatus status, boolean reasonProvided) { }
}
