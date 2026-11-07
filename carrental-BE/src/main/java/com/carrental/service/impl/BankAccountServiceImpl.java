package com.carrental.service.impl;

import static com.carrental.util.RequestChecks.requirePositiveId;
import static com.carrental.util.RequestChecks.requirePrincipal;

import com.carrental.dto.request.bankaccount.CreateBankAccountRequest;
import com.carrental.dto.response.BankAccountResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.BankAccount;
import com.carrental.entity.Customer;
import com.carrental.exception.AppException;
import com.carrental.exception.ErrorCode;
import com.carrental.repository.BankAccountRepository;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.CurrentAccount;
import com.carrental.service.BankAccountService;
import com.carrental.service.CurrentUserService;
import com.carrental.util.DbErrors;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@Transactional(readOnly = true)
public class BankAccountServiceImpl implements BankAccountService {

    private final BankAccountRepository bankAccounts;
    private final CustomerRepository customers;
    private final CurrentUserService currentUsers;

    public BankAccountServiceImpl(BankAccountRepository bankAccounts, CustomerRepository customers,
            CurrentUserService currentUsers) {
        this.bankAccounts = bankAccounts;
        this.customers = customers;
        this.currentUsers = currentUsers;
    }

    @Override
    public PageResponse<BankAccountResponse> listMine(CurrentAccount account, Pageable pageable) {
        Customer owner = requireCurrentOwner(account);
        return PageResponse.from(bankAccounts.findAllByCustomer_Id(owner.getId(), pageable)
                .map(BankAccountResponse::from));
    }

    @Override
    public BankAccountResponse getMine(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        Customer owner = requireCurrentOwner(account);
        return BankAccountResponse.from(findOwned(bankAccountId, owner.getId()));
    }

    @Override
    @Transactional
    public BankAccountResponse create(CurrentAccount account, CreateBankAccountRequest request) {
        Customer owner = requireCurrentOwner(account);
        if (request.shouldMakeDefault()) owner = lockOwner(owner.getId());

        BankAccount bankAccount = new BankAccount();
        bankAccount.setCustomer(owner);
        bankAccount.setBankName(request.normalizedBankName());
        bankAccount.setAccountNumber(request.normalizedAccountNumber());
        bankAccount.setAccountHolder(request.normalizedAccountHolder());
        bankAccount.setDefault(request.shouldMakeDefault());

        if (request.shouldMakeDefault()) clearCurrentDefault(owner.getId());
        try {
            BankAccount saved = bankAccounts.saveAndFlush(bankAccount);
            log.info("bank-account-create ownerId={} bankAccountId={}", owner.getId(), saved.getId());
            return BankAccountResponse.from(saved);
        } catch (DataIntegrityViolationException exception) {
            throw mappedConstraint(exception);
        }
    }

    @Override
    @Transactional
    public BankAccountResponse setDefault(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        Customer owner = requireCurrentOwner(account);
        owner = lockOwner(owner.getId());
        BankAccount selected = findOwned(bankAccountId, owner.getId());
        if (selected.isDefault()) return BankAccountResponse.from(selected);

        clearCurrentDefault(owner.getId());
        selected.setDefault(true);
        try {
            bankAccounts.flush();
            log.info("bank-account-default ownerId={} bankAccountId={}", owner.getId(), selected.getId());
            return BankAccountResponse.from(selected);
        } catch (DataIntegrityViolationException exception) {
            throw mappedConstraint(exception);
        }
    }

    @Override
    @Transactional
    public void delete(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        Customer owner = requireCurrentOwner(account);
        BankAccount selected = findOwned(bankAccountId, owner.getId());
        try {
            bankAccounts.delete(selected);
            bankAccounts.flush();
            log.info("bank-account-delete ownerId={} bankAccountId={}", owner.getId(), selected.getId());
        } catch (DataIntegrityViolationException exception) {
            throw mappedConstraint(exception);
        }
    }

    private Customer requireCurrentOwner(CurrentAccount account) {
        requirePrincipal(account);
        Customer owner = currentUsers.getCurrentUser();
        if (!owner.getId().equals(account.customerId()) || owner.getRole() != account.role()) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        return owner;
    }

    private Customer lockOwner(long ownerId) {
        return customers.findWithLockById(ownerId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private void clearCurrentDefault(long ownerId) {
        Optional<BankAccount> current = bankAccounts.findByCustomer_IdAndIsDefaultTrue(ownerId);
        current.ifPresent(bankAccount -> {
            bankAccount.setDefault(false);
            bankAccounts.flush();
        });
    }

    private BankAccount findOwned(long bankAccountId, long ownerId) {
        return bankAccounts.findByIdAndCustomer_Id(bankAccountId, ownerId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }

    private AppException mappedConstraint(DataIntegrityViolationException exception) {
        ErrorCode code = DbErrors.resolveConstraint(exception);
        if (code != null) return new AppException(code, exception);
        throw exception;
    }

}
