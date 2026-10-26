package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.fieldError;
import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.request.voucher.VoucherListQuery;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.VoucherResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.Voucher;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DiscountType;
import com.carrental.enums.Role;
import com.carrental.enums.VoucherStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.VoucherService;
import com.carrental.util.RequestChecks;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {
    private final VoucherRepository vouchers;
    private final CustomerRepository customers;
    private final Clock clock;

    public VoucherServiceImpl(VoucherRepository vouchers, CustomerRepository customers, Clock clock) {
        this.vouchers = vouchers;
        this.customers = customers;
        this.clock = clock;
    }

    @Override
    @Transactional
    public VoucherResponse create(CurrentAccount actor, CreateVoucherRequest request) {
        requireActiveAdmin(actor);
        validateCreate(request);
        Voucher voucher = request.toEntity();
        if (vouchers.existsByCodeIgnoreCase(voucher.getCode())) {
            throw new AppException(ErrorCode.VOUCHER_CODE_ALREADY_EXISTS);
        }
        vouchers.saveAndFlush(voucher);
        log.info("voucher-create actorId={} voucherId={} status={}", actor.customerId(), voucher.getId(), voucher.getStatus());
        return VoucherResponse.from(voucher, LocalDateTime.now(clock));
    }

    @Override
    public PageResponse<VoucherResponse> list(CurrentAccount actor, VoucherListQuery query) {
        requireActiveAdmin(actor);
        LocalDateTime now = LocalDateTime.now(clock);
        Page<Voucher> page = vouchers.findAll(specification(query, now), query.pageable());
        return PageResponse.from(page.map(v -> VoucherResponse.from(v, now)));
    }

    @Override
    public VoucherResponse get(CurrentAccount actor, long id) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        Voucher voucher = vouchers.findById(id).orElseThrow(RequestChecks::notFound);
        return VoucherResponse.from(voucher, LocalDateTime.now(clock));
    }

    @Override
    @Transactional
    public VoucherResponse update(CurrentAccount actor, long id, UpdateVoucherAdminRequest request) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        // F3 updates usedCount on this same row; lock before checking and saving the quota.
        Voucher voucher = vouchers.findWithLockById(id).orElseThrow(RequestChecks::notFound);
        if (request.getUsageLimit() != null && request.getUsageLimit() < voucher.getUsedCount()) {
            throw new AppException(ErrorCode.VOUCHER_USAGE_LIMIT_CONFLICT);
        }
        if (request.applyTo(voucher)) {
            vouchers.flush();
            log.info("voucher-update actorId={} voucherId={}", actor.customerId(), id);
        }
        return VoucherResponse.from(voucher, LocalDateTime.now(clock));
    }

    @Override
    @Transactional
    public VoucherResponse changeStatus(CurrentAccount actor, long id, ChangeVoucherStatusRequest request) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        Voucher voucher = vouchers.findWithLockById(id).orElseThrow(RequestChecks::notFound);
        VoucherStatus previous = voucher.getStatus();
        if (previous != request.getStatus()) {
            voucher.setStatus(request.getStatus());
            vouchers.flush();
            log.info("voucher-status actorId={} voucherId={} {} -> {}", actor.customerId(), id, previous, voucher.getStatus());
        }
        return VoucherResponse.from(voucher, LocalDateTime.now(clock));
    }

    private void validateCreate(CreateVoucherRequest request) {
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
        if (row.getStatus() != CustomerStatus.ACTIVE || row.getRole() != actor.role() || row.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        return row;
    }
}
