package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.fieldError;

import com.carrental.config.CustomerProperties;
import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.dto.request.customer.ChangeCustomerRoleRequest;
import com.carrental.dto.request.customer.ChangeCustomerStatusRequest;
import com.carrental.dto.request.customer.CustomerListQuery;
import com.carrental.dto.request.customer.UpdateProfileRequest;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.UserDocument;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.UserDocumentRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.AuthService;
import com.carrental.service.CustomerService;
import com.carrental.service.PublicImageStorageService;
import com.carrental.util.RequestChecks;
import jakarta.persistence.EntityManager;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import java.time.Clock;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private static final Pattern PHONE = Pattern.compile("^0[0-9]{9}$");

    private static final char LIKE_ESCAPE = '\\';

    private final CustomerRepository customers;
    private final EntityManager entityManager;
    private final CustomerProperties properties;
    private final Clock clock;
    private final AuthService authService;
    private final UserDocumentRepository documents;
    private final PublicImageStorageService publicImageStorageService;

    public CustomerServiceImpl(CustomerRepository customers, EntityManager entityManager,
            CustomerProperties properties, Clock clock, AuthService authService) {
        this(customers, entityManager, properties, clock, authService, null, null);
    }

    public CustomerServiceImpl(CustomerRepository customers, EntityManager entityManager,
            CustomerProperties properties, Clock clock, AuthService authService,
            UserDocumentRepository documents) {
        this(customers, entityManager, properties, clock, authService, documents, null);
    }

    @Autowired
    public CustomerServiceImpl(CustomerRepository customers, EntityManager entityManager,
            CustomerProperties properties, Clock clock, AuthService authService,
            UserDocumentRepository documents,
            PublicImageStorageService publicImageStorageService) {
        this.customers = customers;
        this.entityManager = entityManager;
        this.properties = properties;
        this.clock = clock;
        this.authService = authService;
        this.documents = documents;
        this.publicImageStorageService = publicImageStorageService;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public CustomerProfileResponse getMe(CurrentAccount account) {
        return customers.findById(account.customerId())
                .map(CustomerProfileResponse::from)
                .orElseThrow(RequestChecks::notFound);
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public CustomerProfileResponse updateMe(CurrentAccount account, UpdateProfileRequest request) {
        if (request == null || !request.hasAnyAllowedField()) throw new AppException(ErrorCode.INVALID_REQUEST);

        Customer customer = customers.findWithLockById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (customer.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);

        String fullName = request.fullNameWasProvided() ? normalizedFullName(request.getFullName()) : null;
        LocalDate dateOfBirth = request.dateOfBirthWasProvided() ? dateOfBirth(request.getDateOfBirth()) : null;
        String address = request.addressWasProvided() ? normalizedAddress(request.getAddress()) : null;
        String email = request.emailWasProvided() ? normalizedEmail(request.getEmail()) : null;
        String phone = request.phoneWasProvided() ? normalizedPhone(request.getPhone()) : null;
        if (request.avatarUrlWasProvided() && !Objects.equals(request.getAvatarUrl(), customer.getAvatarUrl())) {
            throw fieldError("avatarUrl", "Vui lòng tải ảnh đại diện bằng chức năng tải ảnh lên");
        }
        String zaloPhone = request.zaloPhoneWasProvided() ? normalizedZaloPhone(request.getZaloPhone()) : null;
        String contactNote = request.contactNoteWasProvided() ? normalizedContactNote(request.getContactNote()) : null;
        boolean emailChanged = request.emailWasProvided() && !email.equalsIgnoreCase(customer.getEmail());

        if (request.emailWasProvided() && !email.equalsIgnoreCase(customer.getEmail())) {
            customers.findByEmailIgnoreCase(email)
                    .filter(other -> !other.getId().equals(customer.getId()))
                    .ifPresent(other -> { throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS); });
        }
        if (request.phoneWasProvided() && !phone.equals(customer.getPhone())) {
            customers.findByPhone(phone)
                    .filter(other -> !other.getId().equals(customer.getId()))
                    .ifPresent(other -> { throw new AppException(ErrorCode.ACCOUNT_ALREADY_EXISTS); });
        }

        boolean changed = applyProfileUpdate(customer, request, fullName, dateOfBirth, address, email, phone,
                zaloPhone, contactNote);
        if (changed) {
            customers.flush();
            // The database trigger is authoritative for updated_at; reload it after the write.
            entityManager.refresh(customer);
        }
        if (emailChanged) authService.resendVerification(customer.getEmail());
        return CustomerProfileResponse.from(customer);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public PageResponse<CustomerSummaryResponse> listCustomers(CustomerListQuery query) {
        Page<Customer> page = customers.findAll(customerSpecification(query), query.pageable());
        if (page.isEmpty() || documents == null) {
            return PageResponse.from(page.map(CustomerSummaryResponse::from));
        }
        List<Long> customerIds = page.getContent().stream().map(Customer::getId).toList();
        Set<Long> pendingCustomerIds = new HashSet<>(documents.findCustomerIdsWithPendingIdentity(
                customerIds, UserDocumentServiceImpl.IDENTITY_DOC_TYPES, VerificationStatus.PENDING));
        return PageResponse.from(page.map(c -> {
            KycStatus effective = c.getKycStatus() != KycStatus.VERIFIED && pendingCustomerIds.contains(c.getId())
                    ? KycStatus.PENDING
                    : c.getKycStatus();
            return CustomerSummaryResponse.from(c, effective);
        }));
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerAdminResponse getCustomer(long id) {
        Customer c = customers.findById(id).orElseThrow(RequestChecks::notFound);
        boolean hasPending = documents != null && documents.existsByCustomerIdAndDocTypeInAndVerifyStatus(
                c.getId(), UserDocumentServiceImpl.IDENTITY_DOC_TYPES, VerificationStatus.PENDING);
        KycStatus effective = c.getKycStatus() != KycStatus.VERIFIED && hasPending
                ? KycStatus.PENDING
                : c.getKycStatus();
        return CustomerAdminResponse.from(c, effective);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerAdminResponse changeCustomerStatus(
            CurrentAccount actor, long targetId, ChangeCustomerStatusRequest request) {
        String reason = validateStatusRequest(request);
        Customer actorRow;
        Customer target;
        if (customers.existsByIdAndRole(targetId, Role.ADMIN)) {
            // Serialize only admin-account changes, so concurrent requests cannot remove the last active admin.
            List<Customer> admins = customers.findWithLockByRoleOrderByIdAsc(Role.ADMIN);
            actorRow = admins.stream().filter(c -> c.getId().equals(actor.customerId())).findFirst()
                    .orElseThrow(() -> new AppException(ErrorCode.ACCESS_DENIED));
            target = admins.stream().filter(c -> c.getId().equals(targetId)).findFirst()
                    .orElseThrow(RequestChecks::notFound);
        } else {
            actorRow = customers.findById(actor.customerId()).orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
            target = customers.findWithLockById(targetId).orElseThrow(RequestChecks::notFound);
        }
        if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);

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
            log.info("customer-status actorId={} targetId={} {} -> {} reasonProvided={}", actorRow.getId(), target.getId(), oldStatus, target.getStatus(), reason != null);
        }
        return CustomerAdminResponse.from(target);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerAdminResponse changeCustomerRole(
            CurrentAccount actor, long targetId, ChangeCustomerRoleRequest request) {
        if (request == null || !request.roleWasProvided() || request.getRole() == null
                || request.getRole() == Role.ADMIN) {
            throw new AppException(ErrorCode.INVALID_REQUEST, "Vai trò chỉ chấp nhận CUSTOMER hoặc OWNER");
        }
        if (actor == null || actor.customerId() <= 0 || actor.role() != Role.ADMIN) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        Customer actorRow = customers.findById(actor.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (actorRow.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (actorRow.getRole() != Role.ADMIN) throw new AppException(ErrorCode.ACCESS_DENIED);

        Customer target = customers.findWithLockById(targetId).orElseThrow(RequestChecks::notFound);
        if (target.getRole() == Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Không thể đổi vai trò của tài khoản quản trị");
        }
        Role requestedRole = request.getRole();
        if (requestedRole == Role.OWNER) {
            if (target.getStatus() != CustomerStatus.ACTIVE) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Tài khoản đang bị khóa, không thể nâng cấp Chủ xe");
            }
            if (target.getKycStatus() != KycStatus.VERIFIED) {
                throw new AppException(ErrorCode.INVALID_REQUEST, "Khách hàng phải gửi giấy xác nhận và được duyệt KYC trước khi trở thành Chủ xe");
            }
        }
        Role oldRole = target.getRole();
        boolean ownerPromoted = oldRole != requestedRole && requestedRole == Role.OWNER;
        if (oldRole != requestedRole) {
            target.setRole(requestedRole);
            customers.flush();
            log.info("customer-role actorId={} targetId={} {} -> {}", actorRow.getId(), target.getId(), oldRole, requestedRole);
        }
        if (ownerPromoted) notifyOwnerApprovedAfterCommit(target);
        return CustomerAdminResponse.from(target);
    }

    private void notifyOwnerApprovedAfterCommit(Customer customer) {
        long customerId = customer.getId();
        String email = customer.getEmail();
        String fullName = customer.getFullName();
        Runnable notification = () -> authService.notifyOwnerApproved(customerId, email, fullName);
        if (TransactionSynchronizationManager.isSynchronizationActive()
                && TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    notification.run();
                }
            });
        } else {
            notification.run();
        }
    }

    private Specification<Customer> customerSpecification(CustomerListQuery query) {
        return (root, criteriaQuery, builder) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (query.status() != null) predicates.add(builder.equal(root.get("status"), query.status()));
            if (query.kycStatus() != null) {
                if (query.kycStatus() == KycStatus.PENDING) {
                    Subquery<Long> pendingDocs = criteriaQuery.subquery(Long.class);
                    Root<UserDocument> docRoot = pendingDocs.from(UserDocument.class);
                    pendingDocs.select(docRoot.get("customer").get("id"))
                            .where(
                                    builder.equal(docRoot.get("verifyStatus"), VerificationStatus.PENDING),
                                    docRoot.get("docType").in(UserDocumentServiceImpl.IDENTITY_DOC_TYPES));
                    predicates.add(builder.or(
                            builder.equal(root.get("kycStatus"), KycStatus.PENDING),
                            root.get("id").in(pendingDocs)));
                } else {
                    predicates.add(builder.equal(root.get("kycStatus"), query.kycStatus()));
                }
            }
            if (query.role() != null) predicates.add(builder.equal(root.get("role"), query.role()));
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
        if (date.isAfter(LocalDate.now(clock).minusYears(18))) {
            throw fieldError("dateOfBirth", "Bạn phải đủ 18 tuổi để sử dụng dịch vụ thuê xe");
        }
        if (date.isBefore(LocalDate.now(clock).minusYears(100))) {
            throw fieldError("dateOfBirth", "Ngày sinh không hợp lệ");
        }
        return date;
    }

    private String normalizedAddress(String value) {
        if (value == null) return null;
        String normalized = value.strip();
        if (normalized.length() > 300) throw fieldError("address", "Địa chỉ tối đa 300 ký tự");
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizedEmail(String value) {
        String email = AuthInputNormalizer.email(value);
        if (email == null || email.isBlank()) throw fieldError("email", "Email không được để trống");
        if (email.length() > 150) throw fieldError("email", "Email tối đa 150 ký tự");
        int at = email.indexOf('@');
        if (at <= 0 || at != email.lastIndexOf('@') || at == email.length() - 1 || email.contains(" ")) {
            throw fieldError("email", "Email không hợp lệ");
        }
        return email;
    }

    private String normalizedPhone(String value) {
        String phone = value == null ? null : value.strip();
        if (phone == null || !PHONE.matcher(phone).matches()) {
            throw fieldError("phone", "Số điện thoại không đúng định dạng");
        }
        return phone;
    }

    @Override
    @Transactional
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OWNER', 'ADMIN')")
    public CustomerProfileResponse uploadAvatar(CurrentAccount account, MultipartFile file) {
        if (account == null) throw new AppException(ErrorCode.INVALID_TOKEN);
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng chọn một tệp ảnh đại diện");
        }
        if (publicImageStorageService == null) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Dịch vụ lưu trữ ảnh tạm thời không khả dụng");
        }
        Customer customer = customers.findWithLockById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        if (customer.getStatus() != CustomerStatus.ACTIVE) throw new AppException(ErrorCode.INVALID_TOKEN);

        String storedUrl = publicImageStorageService.storeImage(file);
        customer.setAvatarUrl(storedUrl);
        customers.flush();
        entityManager.refresh(customer);
        log.info("customer-avatar-updated customerId={} url={}", customer.getId(), storedUrl);
        return CustomerProfileResponse.from(customer);
    }

    private String normalizedZaloPhone(String value) {
        if (value == null) return null;
        String normalized = value.strip();
        if (normalized.length() > 20) throw fieldError("zaloPhone", "Số Zalo tối đa 20 ký tự");
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizedContactNote(String value) {
        if (value == null) return null;
        String normalized = value.strip();
        if (normalized.length() > 255) throw fieldError("contactNote", "Ghi chú liên hệ tối đa 255 ký tự");
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

    private String escapeLike(String value) {
        return value.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_");
    }

    private static boolean applyProfileUpdate(Customer customer, UpdateProfileRequest request, String fullName,
            LocalDate dateOfBirth, String address, String email, String phone,
            String zaloPhone, String contactNote) {
        boolean changed = false;
        if (request.fullNameWasProvided() && !Objects.equals(fullName, customer.getFullName())) {
            customer.setFullName(fullName);
            changed = true;
        }
        if (request.dateOfBirthWasProvided() && !Objects.equals(dateOfBirth, customer.getDateOfBirth())) {
            customer.setDateOfBirth(dateOfBirth);
            changed = true;
        }
        if (request.addressWasProvided() && !Objects.equals(address, customer.getAddress())) {
            customer.setAddress(address);
            changed = true;
        }
        if (request.emailWasProvided() && !email.equalsIgnoreCase(customer.getEmail())) {
            customer.setEmail(email);
            customer.setEmailVerified(false);
            changed = true;
        }
        if (request.phoneWasProvided() && !Objects.equals(phone, customer.getPhone())) {
            customer.setPhone(phone);
            changed = true;
        }
        if (request.zaloPhoneWasProvided() && !Objects.equals(zaloPhone, customer.getZaloPhone())) {
            customer.setZaloPhone(zaloPhone);
            changed = true;
        }
        if (request.contactNoteWasProvided() && !Objects.equals(contactNote, customer.getContactNote())) {
            customer.setContactNote(contactNote);
            changed = true;
        }
        return changed;
    }
}
