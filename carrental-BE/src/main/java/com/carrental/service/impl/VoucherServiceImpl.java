package com.carrental.service.impl;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.voucher.*;
import com.carrental.dto.response.*;
import com.carrental.entity.Customer;
import com.carrental.entity.Voucher;
import com.carrental.enums.*;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.mapper.VoucherMapper;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.ActionLogService;
import com.carrental.service.VoucherService;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@PreAuthorize("hasRole('ADMIN')")
public class VoucherServiceImpl implements VoucherService {
    private final VoucherRepository vouchers;
    private final CustomerRepository customers;
    private final ActionLogService actionLogService;
    private final CustomerProperties properties;
    private final Clock clock;

    public VoucherServiceImpl(VoucherRepository vouchers, CustomerRepository customers,
            ActionLogService actionLogService, CustomerProperties properties, Clock clock) {
        this.vouchers = vouchers;
        this.customers = customers;
        this.actionLogService = actionLogService;
        this.properties = properties;
        this.clock = clock;
    }

    @Override
    @Transactional
    public VoucherResponse create(CurrentAccount actor, CreateVoucherRequest request) {
        requireActiveAdmin(actor);
        validateCreate(request);
        Voucher voucher = VoucherMapper.toNewEntity(request);
        if (vouchers.existsByCodeIgnoreCase(voucher.getCode())) {
            throw new AppException(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS);
        }
        vouchers.saveAndFlush(voucher);
        actionLogService.voucherStatusChanged("voucher-create", actor.customerId(), voucher.getId(), null, voucher.getStatus());
        return VoucherMapper.toResponse(voucher, LocalDateTime.now(clock));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<VoucherResponse> list(CurrentAccount actor, VoucherListQuery query) {
        requireActiveAdmin(actor);
        LocalDateTime now = LocalDateTime.now(clock);
        Page<Voucher> page = vouchers.findAll(specification(query, now), query.pageable());
        return new PageResponse<>(page.getContent().stream().map(v -> VoucherMapper.toResponse(v, now)).toList(),
                page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse get(CurrentAccount actor, long id) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        Voucher voucher = vouchers.findById(id).orElseThrow(VoucherServiceImpl::notFound);
        return VoucherMapper.toResponse(voucher, LocalDateTime.now(clock));
    }

    @Override
    @Transactional
    public VoucherResponse update(CurrentAccount actor, long id, UpdateVoucherAdminRequest request) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        optionalText(request.getDescription(), "description", 300);
        // F3 updates usedCount on this same row; lock before checking and saving the quota.
        Voucher voucher = vouchers.findWithLockById(id).orElseThrow(VoucherServiceImpl::notFound);
        if (request.getUsageLimit() != null && request.getUsageLimit() < voucher.getUsedCount()) {
            throw new AppException(ErrorCode.VOUCHER_USAGE_LIMIT_CONFLICT);
        }
        if (VoucherMapper.applyAdminUpdate(voucher, request)) {
            vouchers.flush();
            actionLogService.voucherChanged("voucher-update", actor.customerId(), id);
        }
        return VoucherMapper.toResponse(voucher, LocalDateTime.now(clock));
    }

    @Override
    @Transactional
    public VoucherResponse changeStatus(CurrentAccount actor, long id, ChangeVoucherStatusRequest request) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        Voucher voucher = vouchers.findWithLockById(id).orElseThrow(VoucherServiceImpl::notFound);
        VoucherStatus previous = voucher.getStatus();
        if (previous != request.getStatus()) {
            voucher.setStatus(request.getStatus());
            vouchers.flush();
            actionLogService.voucherStatusChanged("voucher-status", actor.customerId(), id, previous, voucher.getStatus());
        }
        return VoucherMapper.toResponse(voucher, LocalDateTime.now(clock));
    }

    private void validateCreate(CreateVoucherRequest request) {
        requiredText(request.getCode(), "code", 50, true);
        optionalText(request.getDescription(), "description", 300);
        if (request.getDiscountType() == DiscountType.PERCENT
                && request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
            throw fieldError("discountValue", "Tỷ lệ phần trăm tối đa 100");
        }
        if (!request.getEndAt().isAfter(request.getStartAt())) throw fieldError("endAt", "Phải sau startAt");
        if (request.getStartAt().getNano() % 1000 != 0 || request.getEndAt().getNano() % 1000 != 0) {
            throw fieldError("endAt", "Thời gian chỉ hỗ trợ tối đa 6 chữ số thập phân");
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

    private Customer requireActiveAdmin(CurrentAccount actor) {
        requirePrincipal(actor);
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

    private static AppException fieldError(String field, String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR, List.of(new FieldErrorResponse(field, message)));
    }

    private static AppException notFound() { return new AppException(ErrorCode.RESOURCE_NOT_FOUND); }
}
