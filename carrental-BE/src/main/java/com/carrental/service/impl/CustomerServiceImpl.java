package com.carrental.service.impl;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.customer.ChangeCustomerStatusRequest;
import com.carrental.dto.request.customer.CustomerListQuery;
import com.carrental.dto.request.customer.UpdateProfileRequest;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.mapper.CustomerMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.security.CurrentAccount;
import com.carrental.service.CustomerService;
import com.carrental.service.CustomerStatusChangeLogger;
import jakarta.persistence.EntityManager;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerServiceImpl implements CustomerService {

    private static final char LIKE_ESCAPE = '\\';

    private final CustomerRepository customers;
    private final EntityManager entityManager;
    private final CustomerStatusLock statusLock;
    private final CustomerStatusChangeLogger statusChangeLogger;
    private final CustomerProperties properties;
    private final Clock clock;

    public CustomerServiceImpl(CustomerRepository customers, EntityManager entityManager, CustomerStatusLock statusLock,
            CustomerStatusChangeLogger statusChangeLogger, CustomerProperties properties, Clock clock) {
        this.customers = customers;
        this.entityManager = entityManager;
        this.statusLock = statusLock;
        this.statusChangeLogger = statusChangeLogger;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public CustomerProfileResponse getMe(CurrentAccount account) {
        return customers.findById(account.customerId())
                .map(CustomerMapper::toProfile)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    public CustomerProfileResponse updateMe(CurrentAccount account, UpdateProfileRequest request) {
        if (request == null || !request.hasAnyAllowedField()) throw new AppException(ErrorCode.INVALID_REQUEST);

        Customer customer = customers.findByIdForUpdate(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (customer.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);

        boolean changed = false;
        if (request.fullNameWasProvided()) {
            String fullName = normalizedFullName(request.getFullName());
            if (!fullName.equals(customer.getFullName())) {
                customer.setFullName(fullName);
                changed = true;
            }
        }
        if (request.dateOfBirthWasProvided()) {
            LocalDate dateOfBirth = dateOfBirth(request.getDateOfBirth());
            if (!java.util.Objects.equals(dateOfBirth, customer.getDateOfBirth())) {
                customer.setDateOfBirth(dateOfBirth);
                changed = true;
            }
        }
        if (request.addressWasProvided()) {
            String address = normalizedAddress(request.getAddress());
            if (!java.util.Objects.equals(address, customer.getAddress())) {
                customer.setAddress(address);
                changed = true;
            }
        }
        if (changed) {
            customers.flush();
            // The database trigger is authoritative for updated_at; reload it after the write.
            entityManager.refresh(customer);
        }
        return CustomerMapper.toProfile(customer);
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<CustomerSummaryResponse> listCustomers(CustomerListQuery query) {
        Page<Customer> page = customers.findAll(customerSpecification(query), query.pageable());
        List<CustomerSummaryResponse> content = page.getContent().stream().map(CustomerMapper::toSummary).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerAdminResponse getCustomer(long id) {
        return customers.findById(id).map(CustomerMapper::toAdmin)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerAdminResponse changeCustomerStatus(
            CurrentAccount actor, long targetId, ChangeCustomerStatusRequest request) {
        String reason = validateStatusRequest(request);
        statusLock.acquire();

        // Re-read and lock the actor after serialization; the JWT converter's earlier DB result is only a snapshot.
        Customer actorRow = customers.findByIdForUpdate(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);

        Customer target = actorRow.getId().equals(targetId)
                ? actorRow
                : customers.findByIdForUpdate(targetId)
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        CustomerStatus oldStatus = target.getStatus();
        CustomerStatus requestedStatus = request.getStatus();
        if (actorRow.getId().equals(target.getId()) && requestedStatus == CustomerStatus.LOCKED) {
            throw new AppException(ErrorCode.ADMIN_SELF_LOCK_FORBIDDEN);
        }

        switch (oldStatus) {
            case ACTIVE -> {
                if (requestedStatus == CustomerStatus.LOCKED) {
                    if (target.getRole() == Role.ADMIN
                            && customers.countByRoleAndStatus(Role.ADMIN, CustomerStatus.ACTIVE) <= 1) {
                        throw new AppException(ErrorCode.LAST_ACTIVE_ADMIN_LOCK_FORBIDDEN);
                    }
                    target.setStatus(CustomerStatus.LOCKED);
                }
            }
            case LOCKED -> {
                if (requestedStatus == CustomerStatus.ACTIVE) target.setStatus(CustomerStatus.ACTIVE);
            }
        }

        if (target.getStatus() != oldStatus) {
            customers.flush();
            statusChangeLogger.record(actorRow.getId(), target.getId(), oldStatus, target.getStatus(), reason != null);
        }
        return CustomerMapper.toAdmin(target);
    }

    private Specification<Customer> customerSpecification(CustomerListQuery query) {
        return (root, criteriaQuery, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (query.status() != null) predicates.add(builder.equal(root.get("status"), query.status()));
            if (query.kycStatus() != null) predicates.add(builder.equal(root.get("kycStatus"), query.kycStatus()));
            if (query.keyword() != null) {
                String pattern = "%" + escapeLike(query.keyword().toLowerCase(Locale.ROOT)) + "%";
                var fullName = builder.like(builder.lower(root.get("fullName")), pattern, LIKE_ESCAPE);
                var email = builder.like(builder.lower(root.get("email")), pattern, LIKE_ESCAPE);
                predicates.add(builder.or(fullName, email));
            }
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private String normalizedFullName(String value) {
        if (value == null) throw fieldError("fullName", "Tên không được để trống");
        String normalized = value.strip();
        if (normalized.isBlank()) throw fieldError("fullName", "Tên không được để trống");
        if (normalized.length() > 150) throw fieldError("fullName", "Tên tối đa 150 ký tự");
        return normalized;
    }

    private LocalDate dateOfBirth(String value) {
        if (value == null) return null;
        LocalDate date;
        try {
            date = LocalDate.parse(value);
        } catch (DateTimeParseException exception) {
            throw fieldError("dateOfBirth", "Ngày sinh phải theo định dạng yyyy-MM-dd");
        }
        if (date.isAfter(LocalDate.now(clock))) {
            throw fieldError("dateOfBirth", "Ngày sinh không được ở tương lai");
        }
        return date;
    }

    private String normalizedAddress(String value) {
        if (value == null) return null;
        String normalized = value.strip();
        if (normalized.length() > 300) throw fieldError("address", "Địa chỉ tối đa 300 ký tự");
        return normalized.isEmpty() ? null : normalized;
    }

    private String validateStatusRequest(ChangeCustomerStatusRequest request) {
        if (request == null || !request.statusWasProvided() || !request.reasonWasProvided() || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String reason = request.getReason();
        if (reason == null || reason.strip().isBlank()) {
            throw fieldError("reason", "Lý do không được để trống");
        }
        reason = reason.strip();
        if (reason.length() > properties.getStatusReasonMaxLength()) {
            throw fieldError("reason", "Lý do vượt quá giới hạn cho phép");
        }
        return reason;
    }

    private AppException fieldError(String field, String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR, List.of(new FieldErrorResponse(field, message)));
    }

    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

}
