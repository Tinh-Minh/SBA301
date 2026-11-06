package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.fieldError;
import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.dto.request.listingpackage.ListingPackageCreateRequest;
import com.carrental.dto.request.listingpackage.ListingPackageUpdateRequest;
import com.carrental.dto.response.ListingPackageResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.ListingPackage;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.ListingPackageService;
import com.carrental.util.RequestChecks;
import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class ListingPackageServiceImpl implements ListingPackageService {

    private static final Pattern CODE = Pattern.compile("[A-Z0-9_-]{1,50}");
    private static final String DEFAULT_BADGE = "THƯỜNG";

    private final ListingPackageRepository packages;
    private final CarSubscriptionRepository subscriptions;
    private final CustomerRepository customers;

    public ListingPackageServiceImpl(ListingPackageRepository packages,
            CarSubscriptionRepository subscriptions, CustomerRepository customers) {
        this.packages = packages;
        this.subscriptions = subscriptions;
        this.customers = customers;
    }

    @Override
    public List<ListingPackageResponse> getPublicActivePackages() {
        return packages.findAllByIsActiveTrueOrderByPriorityLevelDescIdAsc().stream()
                .map(ListingPackageResponse::from).toList();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public List<ListingPackageResponse> listAdminPackages(CurrentAccount actor) {
        requireActiveAdmin(actor);
        return packages.findAllByOrderByPriorityLevelDescIdAsc().stream()
                .map(ListingPackageResponse::from).toList();
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public ListingPackageResponse getAdminPackage(CurrentAccount actor, long id) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        return packages.findById(id).map(ListingPackageResponse::from)
                .orElseThrow(RequestChecks::notFound);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ListingPackageResponse createPackage(CurrentAccount actor, ListingPackageCreateRequest request) {
        requireActiveAdmin(actor);
        if (request == null) throw new AppException(ErrorCode.INVALID_REQUEST);
        String code = normalizedCode(request.code());
        validatePrice(request.price());
        if (packages.existsByCode(code)) throw new AppException(ErrorCode.LISTING_PACKAGE_CODE_ALREADY_EXISTS);

        ListingPackage listingPackage = ListingPackage.builder()
                .name(normalizedRequired(request.name(), "name", 100))
                .code(code)
                .price(request.price())
                .durationDays(request.durationDays())
                .priorityLevel(request.priorityLevel())
                .badgeLabel(normalizedBadge(request.badgeLabel()))
                .description(normalizedDescription(request.description()))
                .isActive(request.isActive() == null || request.isActive())
                .build();
        packages.saveAndFlush(listingPackage);
        log.info("listing-package-create actorId={} packageId={} code={}", actor.customerId(),
                listingPackage.getId(), listingPackage.getCode());
        return ListingPackageResponse.from(listingPackage);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public ListingPackageResponse updatePackage(CurrentAccount actor, long id,
            ListingPackageUpdateRequest request) {
        requireActiveAdmin(actor);
        requirePositiveId(id);
        if (request == null) throw new AppException(ErrorCode.INVALID_REQUEST);
        validatePrice(request.price());

        ListingPackage listingPackage = packages.findWithLockById(id).orElseThrow(RequestChecks::notFound);
        if (!listingPackage.getDurationDays().equals(request.durationDays())
                && subscriptions.existsByListingPackage_Id(id)) {
            throw new AppException(ErrorCode.LISTING_PACKAGE_DURATION_IN_USE);
        }

        listingPackage.setName(normalizedRequired(request.name(), "name", 100));
        listingPackage.setPrice(request.price());
        listingPackage.setDurationDays(request.durationDays());
        listingPackage.setPriorityLevel(request.priorityLevel());
        listingPackage.setBadgeLabel(normalizedBadge(request.badgeLabel()));
        listingPackage.setDescription(normalizedDescription(request.description()));
        listingPackage.setIsActive(request.isActive());
        packages.flush();
        log.info("listing-package-update actorId={} packageId={} active={}", actor.customerId(), id,
                listingPackage.getIsActive());
        return ListingPackageResponse.from(listingPackage);
    }

    private Customer requireActiveAdmin(CurrentAccount actor) {
        requirePrincipal(actor);
        Customer row = customers.findById(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (row.getStatus() != CustomerStatus.ACTIVE || row.getRole() != actor.role()
                || row.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        return row;
    }

    private static String normalizedCode(String value) {
        String code = value == null ? "" : value.strip().toUpperCase(Locale.ROOT);
        if (!CODE.matcher(code).matches()) throw fieldError("code", "Mã gói không hợp lệ");
        return code;
    }

    private static String normalizedRequired(String value, String field, int maxLength) {
        String normalized = value == null ? "" : value.strip();
        if (normalized.isEmpty()) throw fieldError(field, "Không được để trống");
        if (normalized.length() > maxLength) throw fieldError(field, "Vượt quá giới hạn ký tự");
        return normalized;
    }

    private static String normalizedBadge(String value) {
        if (value == null || value.isBlank()) return DEFAULT_BADGE;
        return normalizedRequired(value, "badgeLabel", 50);
    }

    private static String normalizedDescription(String value) {
        if (value == null) return null;
        String normalized = value.strip();
        return normalized.isEmpty() ? null : normalized;
    }

    private static void validatePrice(BigDecimal price) {
        if (price == null || price.signum() < 0) throw fieldError("price", "Giá gói phải từ 0 trở lên");
        BigDecimal normalized = price.stripTrailingZeros();
        if (normalized.scale() > 0 || normalized.precision() > 14) {
            throw fieldError("price", "Giá gói phải là số nguyên tối đa 14 chữ số");
        }
    }
}
