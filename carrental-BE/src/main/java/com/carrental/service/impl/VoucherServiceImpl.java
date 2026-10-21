package com.carrental.service.impl;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.request.voucher.VoucherListQuery;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.VoucherResponse;
import com.carrental.dto.response.VoucherWindowState;
import com.carrental.entity.Customer;
import com.carrental.entity.Voucher;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.Role;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.mapper.VoucherMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CustomerStatusLock;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.VoucherChangeLogger;
import com.carrental.service.VoucherService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.SQLException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Administrator CRUD limited to voucher definition fields owned by Function 1. */
@Service
public class VoucherServiceImpl implements VoucherService {
    static final String VOUCHER_CODE_UNIQUE = "vouchers_code_key";
    private static final BigDecimal MAX_NUMERIC_14 = new BigDecimal("99999999999999");

    private final VoucherRepository vouchers;
    private final CustomerRepository customers;
    private final CustomerStatusLock statusLock;
    private final VoucherChangeLogger changeLogger;
    private final CustomerProperties properties;
    private final Clock clock;

    public VoucherServiceImpl(VoucherRepository vouchers, CustomerRepository customers, CustomerStatusLock statusLock,
            VoucherChangeLogger changeLogger, CustomerProperties properties, Clock clock) {
        this.vouchers = vouchers;
        this.customers = customers;
        this.statusLock = statusLock;
        this.changeLogger = changeLogger;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public VoucherResponse create(CurrentAccount actor, CreateVoucherRequest request) {
        requirePrincipal(actor);
        VoucherInput input = validateCreate(request);
        try {
            lockActiveAdmin(actor);
            if (vouchers.existsByCode(input.code())) {
                changeLogger.failure("voucher-code-precheck", ErrorCode.VOUCHER_CODE_ALREADY_EXISTS,
                        actor.customerId(), null, "PrecheckConflict", VOUCHER_CODE_UNIQUE);
                throw new AppException(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS);
            }

            Voucher voucher = new Voucher();
            voucher.setCode(input.code());
            voucher.setDescription(input.description());
            voucher.setDiscountType(input.discountType());
            voucher.setDiscountValue(input.discountValue());
            voucher.setMaxDiscount(input.maxDiscount());
            voucher.setMinOrderAmount(input.minOrderAmount());
            voucher.setStartAt(input.startAt());
            voucher.setEndAt(input.endAt());
            voucher.setUsageLimit(input.usageLimit());
            voucher.setPerUserLimit(input.perUserLimit());
            voucher.setUsedCount(0);
            voucher.setStatus(VoucherStatus.ACTIVE);
            Voucher saved = vouchers.saveAndFlush(voucher);
            LocalDateTime evaluatedAt = LocalDateTime.now(clock);
            changeLogger.changed("voucher-create", actor.customerId(), saved.getId(), null, saved.getStatus());
            return VoucherMapper.toResponse(saved, evaluatedAt);
        } catch (DataIntegrityViolationException exception) {
            if (hasExactViolation(exception, "23505", VOUCHER_CODE_UNIQUE)) {
                changeLogger.failure("voucher-code-unique-conflict", ErrorCode.VOUCHER_CODE_ALREADY_EXISTS,
                        actor.customerId(), null, exception.getClass().getSimpleName(), VOUCHER_CODE_UNIQUE);
                throw new AppException(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS, exception);
            }
            logDatabaseFailure("voucher-create-integrity-failure", actor.customerId(), null, exception);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("voucher-create-database-failure", actor.customerId(), null, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("voucher-create-unexpected-failure", actor.customerId(), null, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<VoucherResponse> list(CurrentAccount actor, VoucherListQuery query) {
        requirePrincipal(actor);
        try {
            requireActiveAdmin(actor);
            Objects.requireNonNull(query);
            // Use the same one-time clock snapshot in the SQL window predicate and every returned row.
            LocalDateTime evaluatedAt = LocalDateTime.now(clock);
            Page<Voucher> page = vouchers.findAll(specification(query, evaluatedAt), query.pageable());
            List<VoucherResponse> content = page.getContent().stream()
                    .map(voucher -> VoucherMapper.toResponse(voucher, evaluatedAt)).toList();
            return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
        } catch (DataAccessException exception) {
            logDatabaseFailure("voucher-list-database-failure", actor.customerId(), null, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("voucher-list-unexpected-failure", actor.customerId(), null, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    public VoucherResponse get(CurrentAccount actor, long id) {
        requirePrincipal(actor);
        requirePositiveId(id);
        try {
            requireActiveAdmin(actor);
            LocalDateTime evaluatedAt = LocalDateTime.now(clock);
            Voucher voucher = vouchers.findById(id).orElseThrow(VoucherServiceImpl::notFound);
            return VoucherMapper.toResponse(voucher, evaluatedAt);
        } catch (DataAccessException exception) {
            logDatabaseFailure("voucher-read-database-failure", actor.customerId(), id, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("voucher-read-unexpected-failure", actor.customerId(), id, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public VoucherResponse update(CurrentAccount actor, long id, UpdateVoucherAdminRequest request) {
        requirePrincipal(actor);
        requirePositiveId(id);
        UpdateInput input = validateUpdate(request);
        try {
            lockActiveAdmin(actor);
            // The voucher is first materialized under its row lock, after any F3 counter writer commits.
            Voucher voucher = vouchers.findByIdForUpdate(id).orElseThrow(VoucherServiceImpl::notFound);
            if (input.usageLimit() != null && input.usageLimit() < voucher.getUsedCount()) {
                changeLogger.failure("voucher-usage-limit-conflict", ErrorCode.VOUCHER_USAGE_LIMIT_CONFLICT,
                        actor.customerId(), id, "QuotaConflict", null);
                throw new AppException(ErrorCode.VOUCHER_USAGE_LIMIT_CONFLICT);
            }
            boolean changed = !Objects.equals(voucher.getDescription(), input.description())
                    || !Objects.equals(voucher.getUsageLimit(), input.usageLimit());
            if (changed) {
                voucher.setDescription(input.description());
                voucher.setUsageLimit(input.usageLimit());
                vouchers.flush();
                changeLogger.changed("voucher-update", actor.customerId(), id);
            }
            return VoucherMapper.toResponse(voucher, LocalDateTime.now(clock));
        } catch (DataIntegrityViolationException exception) {
            logDatabaseFailure("voucher-update-integrity-failure", actor.customerId(), id, exception);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("voucher-update-database-failure", actor.customerId(), id, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("voucher-update-unexpected-failure", actor.customerId(), id, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public VoucherResponse changeStatus(CurrentAccount actor, long id, ChangeVoucherStatusRequest request) {
        requirePrincipal(actor);
        requirePositiveId(id);
        VoucherStatus requested = validateStatus(request);
        try {
            lockActiveAdmin(actor);
            Voucher voucher = vouchers.findByIdForUpdate(id).orElseThrow(VoucherServiceImpl::notFound);
            VoucherStatus oldStatus = voucher.getStatus();
            switch (oldStatus) {
                case ACTIVE -> { if (requested == VoucherStatus.INACTIVE) voucher.setStatus(VoucherStatus.INACTIVE); }
                case INACTIVE -> { if (requested == VoucherStatus.ACTIVE) voucher.setStatus(VoucherStatus.ACTIVE); }
            }
            if (voucher.getStatus() != oldStatus) {
                vouchers.flush();
                changeLogger.changed("voucher-status", actor.customerId(), id, oldStatus, voucher.getStatus());
            }
            return VoucherMapper.toResponse(voucher, LocalDateTime.now(clock));
        } catch (DataIntegrityViolationException exception) {
            logDatabaseFailure("voucher-status-integrity-failure", actor.customerId(), id, exception);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("voucher-status-database-failure", actor.customerId(), id, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("voucher-status-unexpected-failure", actor.customerId(), id, exception);
            throw exception;
        }
    }

    private Specification<Voucher> specification(VoucherListQuery query, LocalDateTime now) {
        return (root, criteria, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (query.code() != null) predicates.add(builder.equal(root.get("code"), query.code()));
            if (query.status() != null) predicates.add(builder.equal(root.get("status"), query.status()));
            if (query.discountType() != null) predicates.add(builder.equal(root.get("discountType"), query.discountType()));
            if (query.window() != null) {
                switch (query.window()) {
                    case UPCOMING -> predicates.add(builder.greaterThan(root.get("startAt"), now));
                    case CURRENT -> {
                        predicates.add(builder.lessThanOrEqualTo(root.get("startAt"), now));
                        predicates.add(builder.greaterThan(root.get("endAt"), now));
                    }
                    case ENDED -> predicates.add(builder.lessThanOrEqualTo(root.get("endAt"), now));
                }
            }
            return builder.and(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    private Customer lockActiveAdmin(CurrentAccount actor) {
        statusLock.acquire();
        Customer row = customers.findByIdForUpdate(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        validateAdminSnapshot(row, actor);
        return row;
    }

    private Customer requireActiveAdmin(CurrentAccount actor) {
        Customer row = customers.findById(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        validateAdminSnapshot(row, actor);
        return row;
    }

    private void validateAdminSnapshot(Customer row, CurrentAccount actor) {
        if (row.getStatus() != CustomerStatus.ACTIVE || row.getRole() != actor.role()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        if (row.getRole() != Role.ADMIN) throw new AppException(ErrorCode.INVALID_TOKEN);
    }

    private VoucherInput validateCreate(CreateVoucherRequest request) {
        if (request == null || !request.codeWasProvided() || !request.discountTypeWasProvided()
                || !request.discountValueWasProvided() || !request.startAtWasProvided() || !request.endAtWasProvided()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String code = requiredText(request.getCode(), "code", 50, true);
        String description = optionalText(request.getDescription(), "description", 300);
        BigDecimal discountValue = numeric14(request.getDiscountValue(), "discountValue", false);
        if (discountValue.signum() <= 0) throw fieldError("discountValue", "Phải lớn hơn 0");
        if (request.getDiscountType() == DiscountType.PERCENT && discountValue.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw fieldError("discountValue", "Tỷ lệ phần trăm tối đa 100");
        }
        BigDecimal maxDiscount = request.getMaxDiscount() == null ? null : numeric14(request.getMaxDiscount(), "maxDiscount", false);
        BigDecimal minOrderAmount = numeric14(request.getMinOrderAmount(), "minOrderAmount", false);
        if (maxDiscount != null && maxDiscount.signum() < 0) throw fieldError("maxDiscount", "Không được âm");
        if (minOrderAmount.signum() < 0) throw fieldError("minOrderAmount", "Không được âm");
        if (request.getStartAt() == null || request.getEndAt() == null || !request.getEndAt().isAfter(request.getStartAt())) {
            throw fieldError("endAt", "Phải sau startAt");
        }
        Integer usageLimit = request.getUsageLimit();
        Integer perUserLimit = request.getPerUserLimit();
        if (usageLimit != null && usageLimit <= 0) throw fieldError("usageLimit", "Phải lớn hơn 0 hoặc null");
        if (perUserLimit == null || perUserLimit <= 0) throw fieldError("perUserLimit", "Phải lớn hơn 0");
        return new VoucherInput(code, description, request.getDiscountType(), discountValue, maxDiscount,
                minOrderAmount, request.getStartAt(), request.getEndAt(), usageLimit, perUserLimit);
    }

    private UpdateInput validateUpdate(UpdateVoucherAdminRequest request) {
        if (request == null || !request.descriptionWasProvided() || !request.usageLimitWasProvided()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        String description = optionalText(request.getDescription(), "description", 300);
        Integer usageLimit = request.getUsageLimit();
        if (usageLimit != null && usageLimit <= 0) throw fieldError("usageLimit", "Phải lớn hơn 0 hoặc null");
        return new UpdateInput(description, usageLimit);
    }

    private VoucherStatus validateStatus(ChangeVoucherStatusRequest request) {
        if (request == null || !request.statusWasProvided() || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        return request.getStatus();
    }

    private BigDecimal numeric14(BigDecimal raw, String field, boolean nullable) {
        if (raw == null) {
            if (nullable) return null;
            throw fieldError(field, "Phải là số nguyên trong giới hạn NUMERIC(14,0)");
        }
        BigDecimal canonical = raw.stripTrailingZeros();
        if (canonical.scale() > 0 || canonical.abs().compareTo(MAX_NUMERIC_14) > 0) {
            throw fieldError(field, "Phải là số nguyên trong giới hạn NUMERIC(14,0)");
        }
        // The range check above keeps this exact scale conversion bounded before PostgreSQL can round it.
        return canonical.setScale(0, RoundingMode.UNNECESSARY);
    }

    private String requiredText(String raw, String field, int maxCodePoints, boolean rejectControls) {
        if (raw == null) throw fieldError(field, "Không được để trống");
        String normalized = raw.strip();
        if (normalized.isBlank()) throw fieldError(field, "Không được để trống");
        validateTextLength(normalized, field, maxCodePoints);
        if (normalized.codePoints().anyMatch(cp -> cp == 0 || (rejectControls && Character.isISOControl(cp)))) {
            throw fieldError(field, "Chứa ký tự không hợp lệ");
        }
        return normalized;
    }

    private String optionalText(String raw, String field, int maxCodePoints) {
        if (raw == null) return null;
        String normalized = raw.strip();
        if (normalized.isEmpty()) return null;
        validateTextLength(normalized, field, maxCodePoints);
        if (normalized.codePoints().anyMatch(cp -> cp == 0)) throw fieldError(field, "Chứa ký tự không hợp lệ");
        return normalized;
    }

    private void validateTextLength(String value, String field, int maximum) {
        if (value.codePointCount(0, value.length()) > maximum) throw fieldError(field, "Vượt quá giới hạn độ dài");
    }

    private void requirePrincipal(CurrentAccount actor) {
        if (actor == null || actor.customerId() <= 0 || actor.role() == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private static boolean hasExactViolation(Throwable failure, String expectedState, String expectedConstraint) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof SQLException sql && expectedState.equals(sql.getSQLState())
                    && expectedConstraint.equals(constraintName(failure))) return true;
            if (current instanceof ConstraintViolationException violation
                    && violation.getSQLException() != null && expectedState.equals(violation.getSQLException().getSQLState())
                    && expectedConstraint.equals(violation.getConstraintName())) return true;
        }
        return false;
    }

    private static String constraintName(Throwable failure) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof ConstraintViolationException violation) return violation.getConstraintName();
        }
        return null;
    }

    private void logDatabaseFailure(String category, long actorId, Long voucherId, DataAccessException exception) {
        ErrorCode code = exception instanceof PessimisticLockingFailureException
                || exception instanceof DataAccessResourceFailureException || hasSqlState(exception, "55P03")
                ? ErrorCode.DEPENDENCY_UNAVAILABLE : ErrorCode.INTERNAL_ERROR;
        changeLogger.failure(category, code, actorId, voucherId, exception.getClass().getSimpleName(), null);
    }

    private static boolean hasSqlState(Throwable failure, String expected) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof SQLException sql && expected.equals(sql.getSQLState())) return true;
        }
        return false;
    }

    private void logUnexpected(String category, long actorId, Long voucherId, RuntimeException exception) {
        changeLogger.failure(category, ErrorCode.INTERNAL_ERROR, actorId, voucherId,
                exception.getClass().getSimpleName(), null);
    }

    private static AppException fieldError(String field, String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR, List.of(new FieldErrorResponse(field, message)));
    }

    private static AppException notFound() { return new AppException(ErrorCode.RESOURCE_NOT_FOUND); }

    private record VoucherInput(String code, String description, DiscountType discountType, BigDecimal discountValue,
            BigDecimal maxDiscount, BigDecimal minOrderAmount, LocalDateTime startAt, LocalDateTime endAt,
            Integer usageLimit, Integer perUserLimit) { }

    private record UpdateInput(String description, Integer usageLimit) { }
}
