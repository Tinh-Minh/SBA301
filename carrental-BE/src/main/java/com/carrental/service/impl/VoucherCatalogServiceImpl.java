package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.dto.response.VoucherCatalogResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.ListingPackage;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.enums.VoucherStatus;
import com.carrental.enums.PaymentStatus;
import com.carrental.enums.SubscriptionStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.CarSubscriptionRepository;
import com.carrental.repository.ListingPackageRepository;
import com.carrental.repository.VoucherRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.VoucherCatalogService;
import com.carrental.util.RequestChecks;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class VoucherCatalogServiceImpl implements VoucherCatalogService {

    private final VoucherRepository vouchers;
    private final ListingPackageRepository packages;
    private final CustomerRepository customers;
    private final CarSubscriptionRepository subscriptions;
    private final Clock clock;

    public VoucherCatalogServiceImpl(VoucherRepository vouchers, ListingPackageRepository packages,
            CustomerRepository customers, CarSubscriptionRepository subscriptions, Clock clock) {
        this.vouchers = vouchers;
        this.packages = packages;
        this.customers = customers;
        this.subscriptions = subscriptions;
        this.clock = clock;
    }

    @Override
    public List<VoucherCatalogResponse> listAvailableForPackage(CurrentAccount actor, long packageId) {
        requireActiveAccount(actor);
        requirePositiveId(packageId);

        ListingPackage listingPackage = packages.findById(packageId)
                .filter(ListingPackage::getIsActive)
                .orElseThrow(RequestChecks::notFound);
        LocalDateTime now = LocalDateTime.now(clock);
        List<com.carrental.entity.Voucher> candidates = vouchers.findAvailableForPackage(
                VoucherStatus.ACTIVE, now, listingPackage.getPrice());
        if (candidates.isEmpty()) return List.of();

        List<Long> voucherIds = candidates.stream().map(com.carrental.entity.Voucher::getId).toList();
        Map<Long, Long> usesByVoucher = subscriptions
                .countVoucherUsesByCustomerIdAndVoucherIds(actor.customerId(), voucherIds,
                        SubscriptionStatus.CANCELLED, PaymentStatus.REFUNDED).stream()
                .collect(Collectors.toMap(CarSubscriptionRepository.VoucherUsageCount::getVoucherId,
                        CarSubscriptionRepository.VoucherUsageCount::getUsageCount));
        return candidates.stream()
                .filter(voucher -> usesByVoucher.getOrDefault(voucher.getId(), 0L) < voucher.getPerUserLimit())
                .map(VoucherCatalogResponse::from).toList();
    }

    private Customer requireActiveAccount(CurrentAccount actor) {
        requirePrincipal(actor);
        Customer row = customers.findById(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (row.getStatus() != CustomerStatus.ACTIVE || row.getRole() != actor.role()
                || row.getRole() == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        return row;
    }
}
