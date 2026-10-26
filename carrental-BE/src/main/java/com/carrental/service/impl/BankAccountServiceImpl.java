package com.carrental.service.impl;

import com.carrental.dto.request.bankaccount.BankAccountListQuery;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.FieldErrorResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.mapper.BankAccountMapper;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.ActionLogService;
import com.carrental.service.BankAccountService;
import java.util.List;
import java.util.Objects;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Bank account operations scoped to the authenticated owner and leader schema. */
@Service
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccounts;
    private final CustomerRepository customers;
    private final ActionLogService actionLogService;
    public BankAccountServiceImpl(BankAccountRepository bankAccounts, CustomerRepository customers,
            ActionLogService actionLogService) {
        this.bankAccounts = bankAccounts;
        this.customers = customers;
        this.actionLogService = actionLogService;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public BankAccountResponse create(CurrentAccount account, CreateBankAccountRequest request) {
        requirePrincipal(account);
        PayeeInput input = validateRequest(request);
        Customer owner = lockActiveOwner(account);
        if (bankAccounts.existsByCustomerIdAndBankNameAndAccountNumber(owner.getId(), input.bankName(), input.accountNumber())) {
            throw new AppException(ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS);
        }
        if (input.makeDefault()) clearDefault(owner.getId());
        BankAccount saved = bankAccounts.saveAndFlush(BankAccountMapper.toNewEntity(owner,
                input.bankName(), input.accountNumber(), input.accountHolder(), input.makeDefault()));
        actionLogService.bankAccountChanged("bank-account-create", owner.getId(), saved.getId());
        return BankAccountMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<BankAccountResponse> list(CurrentAccount account, BankAccountListQuery query) {
        Customer owner = activeOwner(account);
        Objects.requireNonNull(query);
        Page<BankAccount> page = bankAccounts.findAllByCustomerId(owner.getId(), query.pageable());
        List<BankAccountResponse> content = page.getContent().stream().map(BankAccountMapper::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public BankAccountResponse get(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        Customer owner = activeOwner(account);
        return bankAccounts.findByIdAndCustomerId(bankAccountId, owner.getId())
                .map(BankAccountMapper::toResponse)
                .orElseThrow(() -> notFound());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public BankAccountResponse setDefault(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        requirePrincipal(account);
        // One owner lock serializes all default changes, including the first default account.
        Customer owner = lockActiveOwner(account);
        BankAccount target = bankAccounts.findByIdAndCustomerId(bankAccountId, owner.getId()).orElseThrow(BankAccountServiceImpl::notFound);
        if (Boolean.TRUE.equals(target.getIsDefault())) return BankAccountMapper.toResponse(target);
        clearDefault(owner.getId());
        target.setIsDefault(true);
        bankAccounts.flush();
        actionLogService.bankAccountChanged("bank-account-default", owner.getId(), target.getId());
        return BankAccountMapper.toResponse(target);
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public void delete(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        requirePrincipal(account);
        Customer owner = lockActiveOwner(account);
        BankAccount target = bankAccounts.findByIdAndCustomerId(bankAccountId, owner.getId()).orElseThrow(BankAccountServiceImpl::notFound);
        bankAccounts.delete(target);
        bankAccounts.flush();
        actionLogService.bankAccountChanged("bank-account-delete", owner.getId(), target.getId());
    }

    private void clearDefault(long ownerId) {
        bankAccounts.findByCustomerIdAndIsDefaultTrue(ownerId).ifPresent(previous -> {
            previous.setIsDefault(false);
            bankAccounts.flush(); // Clear the partial unique index before setting the new default.
        });
    }

    private Customer lockActiveOwner(CurrentAccount account) {
        Customer owner = customers.findWithLockById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        requireCurrentOwner(owner, account);
        return owner;
    }

    private Customer activeOwner(CurrentAccount account) {
        requirePrincipal(account);
        Customer owner = customers.findById(account.customerId())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_TOKEN));
        requireCurrentOwner(owner, account);
        return owner;
    }

    private void requireCurrentOwner(Customer owner, CurrentAccount account) {
        if (owner.getStatus() != CustomerStatus.ACTIVE || owner.getRole() != account.role()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        if (owner.getRole() != Role.CUSTOMER && owner.getRole() != Role.ADMIN) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
    }

    private static void requirePrincipal(CurrentAccount account) {
        if (account == null || account.customerId() <= 0 || account.role() == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private static void requirePositiveId(long id) {
        if (id <= 0) throw new AppException(ErrorCode.INVALID_REQUEST);
    }

    private PayeeInput validateRequest(CreateBankAccountRequest request) {
        if (request == null || !request.bankNameWasProvided() || !request.accountNumberWasProvided()
                || !request.accountHolderWasProvided()) throw new AppException(ErrorCode.INVALID_REQUEST);
        return new PayeeInput(normalize(request.getBankName(), "bankName", 100),
                normalize(request.getAccountNumber(), "accountNumber", 30),
                normalize(request.getAccountHolder(), "accountHolder", 150), request.isMakeDefault());
    }

    private String normalize(String raw, String field, int maxCodePoints) {
        if (raw == null) throw fieldError(field, "Trường bắt buộc");
        String value = raw.strip();
        if (value.isBlank()) throw fieldError(field, "Trường không được để trống");
        int length = value.codePointCount(0, value.length());
        if (length > maxCodePoints) throw fieldError(field, "Vượt quá giới hạn độ dài");
        if (value.codePoints().anyMatch(Character::isISOControl)) throw fieldError(field, "Chứa ký tự không hợp lệ");
        return value;
    }

    private static AppException fieldError(String field, String message) {
        return new AppException(ErrorCode.VALIDATION_ERROR, List.of(new FieldErrorResponse(field, message)));
    }

    private static AppException notFound() { return new AppException(ErrorCode.RESOURCE_NOT_FOUND); }

    private record PayeeInput(String bankName, String accountNumber, String accountHolder, boolean makeDefault) { }
}
