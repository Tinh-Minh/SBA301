package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.fieldError;
import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.dto.request.bankaccount.BankAccountListQuery;
import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.BankAccountService;
import com.carrental.util.RequestChecks;
import java.util.Objects;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Bank account operations scoped to the authenticated owner and leader schema. */
@Slf4j
@Service
@PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
@Transactional(readOnly = true)
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccounts;
    private final CustomerRepository customers;

    public BankAccountServiceImpl(BankAccountRepository bankAccounts, CustomerRepository customers) {
        this.bankAccounts = bankAccounts;
        this.customers = customers;
    }

    @Override
    @Transactional
    public BankAccountResponse create(CurrentAccount account, CreateBankAccountRequest request) {
        requirePrincipal(account);
        PayeeInput input = validateRequest(request);
        Customer owner = lockActiveOwner(account);
        if (bankAccounts.existsByCustomerIdAndBankNameAndAccountNumber(owner.getId(), input.bankName(), input.accountNumber())) {
            throw new AppException(ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS);
        }
        if (input.makeDefault()) clearDefault(owner.getId());
        BankAccount saved = bankAccounts.saveAndFlush(newAccount(owner, input));
        log.info("bank-account-create ownerId={} bankAccountId={}", owner.getId(), saved.getId());
        return BankAccountResponse.from(saved);
    }

    @Override
    public PageResponse<BankAccountResponse> list(CurrentAccount account, BankAccountListQuery query) {
        Customer owner = activeOwner(account);
        Objects.requireNonNull(query);
        Page<BankAccount> page = bankAccounts.findAllByCustomerId(owner.getId(), query.pageable());
        return PageResponse.from(page.map(BankAccountResponse::from));
    }

    @Override
    public BankAccountResponse get(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        Customer owner = activeOwner(account);
        return bankAccounts.findByIdAndCustomerId(bankAccountId, owner.getId())
                .map(BankAccountResponse::from)
                .orElseThrow(RequestChecks::notFound);
    }

    @Override
    @Transactional
    public BankAccountResponse setDefault(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        requirePrincipal(account);
        // One owner lock serializes all default changes, including the first default account.
        Customer owner = lockActiveOwner(account);
        BankAccount target = bankAccounts.findByIdAndCustomerId(bankAccountId, owner.getId())
                .orElseThrow(RequestChecks::notFound);
        if (Boolean.TRUE.equals(target.getIsDefault())) return BankAccountResponse.from(target);
        clearDefault(owner.getId());
        target.setIsDefault(true);
        bankAccounts.flush();
        log.info("bank-account-default ownerId={} bankAccountId={}", owner.getId(), target.getId());
        return BankAccountResponse.from(target);
    }

    @Override
    @Transactional
    public void delete(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        requirePrincipal(account);
        Customer owner = lockActiveOwner(account);
        BankAccount target = bankAccounts.findByIdAndCustomerId(bankAccountId, owner.getId())
                .orElseThrow(RequestChecks::notFound);
        bankAccounts.delete(target);
        bankAccounts.flush();
        log.info("bank-account-delete ownerId={} bankAccountId={}", owner.getId(), target.getId());
    }

    private static BankAccount newAccount(Customer owner, PayeeInput input) {
        BankAccount account = new BankAccount();
        account.setCustomer(owner);
        account.setBankName(input.bankName());
        account.setAccountNumber(input.accountNumber());
        account.setAccountHolder(input.accountHolder());
        account.setIsDefault(input.makeDefault());
        return account;
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

    private record PayeeInput(String bankName, String accountNumber, String accountHolder, boolean makeDefault) { }
}
