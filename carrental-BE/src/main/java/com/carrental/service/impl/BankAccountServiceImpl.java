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
import com.carrental.repository.CustomerStatusLock;
import com.carrental.security.CurrentAccount;
import com.carrental.service.BankAccountChangeLogger;
import com.carrental.service.BankAccountService;
import java.sql.SQLException;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.TreeSet;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.PessimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Bank account operations scoped to the authenticated owner and leader schema. */
@Service
public class BankAccountServiceImpl implements BankAccountService {

    static final String CUSTOMER_BANK_ACCOUNT_UNIQUE = "bank_accounts_customer_id_bank_name_account_number_key";
    static final String DEFAULT_PER_CUSTOMER_UNIQUE = "uq_bank_default_per_customer";
    static final String PAYOUT_BANK_RECIPIENT_FK = "payouts_bank_account_id_recipient_id_fkey";

    private final BankAccountRepository bankAccounts;
    private final CustomerRepository customers;
    private final CustomerStatusLock statusLock;
    private final BankAccountChangeLogger changeLogger;
    public BankAccountServiceImpl(BankAccountRepository bankAccounts, CustomerRepository customers,
            CustomerStatusLock statusLock, BankAccountChangeLogger changeLogger) {
        this.bankAccounts = bankAccounts;
        this.customers = customers;
        this.statusLock = statusLock;
        this.changeLogger = changeLogger;
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public BankAccountResponse create(CurrentAccount account, CreateBankAccountRequest request) {
        requirePrincipal(account);
        PayeeInput input = validateRequest(request);
        try {
            Customer owner = lockActiveOwner(account);
            if (bankAccounts.existsByCustomer_IdAndBankNameAndAccountNumber(
                    owner.getId(), input.bankName(), input.accountNumber())) {
                changeLogger.failure("bank-account-duplicate", ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS,
                        account.customerId(), null, "PrecheckConflict", CUSTOMER_BANK_ACCOUNT_UNIQUE);
                throw new AppException(ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS);
            }

            if (input.makeDefault()) {
                BankAccount previous = bankAccounts.findByCustomer_IdAndIsDefaultTrue(owner.getId()).orElse(null);
                if (previous != null) {
                    BankAccount lockedPrevious = lockRows(owner.getId(), List.of(previous.getId())).getFirst();
                    lockedPrevious.setIsDefault(false);
                    bankAccounts.flush();
                }
            }
            BankAccount bankAccount = new BankAccount();
            bankAccount.setCustomer(owner);
            bankAccount.setBankName(input.bankName());
            bankAccount.setAccountNumber(input.accountNumber());
            bankAccount.setAccountHolder(input.accountHolder());
            bankAccount.setIsDefault(input.makeDefault());
            BankAccount saved = bankAccounts.saveAndFlush(bankAccount);
            changeLogger.changed("bank-account-create", owner.getId(), saved.getId());
            return BankAccountMapper.toResponse(saved);
        } catch (DataIntegrityViolationException exception) {
            ErrorCode conflict = exactUniqueConflict(exception);
            if (conflict != null) {
                String constraint = conflict == ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS
                        ? CUSTOMER_BANK_ACCOUNT_UNIQUE : DEFAULT_PER_CUSTOMER_UNIQUE;
                changeLogger.failure("bank-account-constraint-conflict", conflict, account.customerId(), null,
                        exception.getClass().getSimpleName(), constraint);
                throw new AppException(conflict, exception);
            }
            logDatabaseFailure("bank-account-create-integrity-failure", account.customerId(), null, exception);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("bank-account-create-database-failure", account.customerId(), null, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("bank-account-create-unexpected-failure", account.customerId(), null, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public PageResponse<BankAccountResponse> list(CurrentAccount account, BankAccountListQuery query) {
        Customer owner = activeOwner(account);
        Objects.requireNonNull(query);
        Page<BankAccount> page = bankAccounts.findAllByCustomer_Id(owner.getId(), query.pageable());
        List<BankAccountResponse> content = page.getContent().stream().map(BankAccountMapper::toResponse).toList();
        return new PageResponse<>(content, page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional(readOnly = true)
    public BankAccountResponse get(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        Customer owner = activeOwner(account);
        return bankAccounts.findByIdAndCustomer_Id(bankAccountId, owner.getId())
                .map(BankAccountMapper::toResponse)
                .orElseThrow(() -> notFound());
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public BankAccountResponse setDefault(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        requirePrincipal(account);
        try {
            Customer owner = lockActiveOwner(account);
            BankAccount targetSnapshot = bankAccounts.findByIdAndCustomer_Id(bankAccountId, owner.getId())
                    .orElseThrow(() -> notFound());
            BankAccount currentDefault = bankAccounts.findByCustomer_IdAndIsDefaultTrue(owner.getId()).orElse(null);
            TreeSet<Long> ids = new TreeSet<>();
            ids.add(targetSnapshot.getId());
            if (currentDefault != null) ids.add(currentDefault.getId());
            List<BankAccount> lockedRows = lockRows(owner.getId(), ids);
            BankAccount target = findLocked(lockedRows, bankAccountId).orElseThrow(() -> notFound());
            if (Boolean.TRUE.equals(target.getIsDefault())) return BankAccountMapper.toResponse(target);

            BankAccount oldDefault = lockedRows.stream().filter(BankAccount::getIsDefault).findFirst().orElse(null);
            if (oldDefault != null) {
                oldDefault.setIsDefault(false);
                bankAccounts.flush();
            }
            target.setIsDefault(true);
            bankAccounts.flush();
            changeLogger.changed("bank-account-default", owner.getId(), target.getId());
            return BankAccountMapper.toResponse(target);
        } catch (DataIntegrityViolationException exception) {
            ErrorCode conflict = exactUniqueConflict(exception);
            if (conflict != null) {
                String constraint = conflict == ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS
                        ? CUSTOMER_BANK_ACCOUNT_UNIQUE : DEFAULT_PER_CUSTOMER_UNIQUE;
                changeLogger.failure("bank-account-default-constraint-conflict", conflict, account.customerId(),
                        bankAccountId, exception.getClass().getSimpleName(), constraint);
                throw new AppException(conflict, exception);
            }
            logDatabaseFailure("bank-account-default-integrity-failure", account.customerId(), bankAccountId, exception);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("bank-account-default-database-failure", account.customerId(), bankAccountId, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("bank-account-default-unexpected-failure", account.customerId(), bankAccountId, exception);
            throw exception;
        }
    }

    @Override
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Transactional
    public void delete(CurrentAccount account, long bankAccountId) {
        requirePositiveId(bankAccountId);
        requirePrincipal(account);
        try {
            Customer owner = lockActiveOwner(account);
            bankAccounts.findByIdAndCustomer_Id(bankAccountId, owner.getId()).orElseThrow(() -> notFound());
            BankAccount target = bankAccounts.findOwnedByIdForUpdate(bankAccountId, owner.getId())
                    .orElseThrow(() -> notFound());
            bankAccounts.delete(target);
            bankAccounts.flush();
            changeLogger.changed("bank-account-delete", owner.getId(), target.getId());
        } catch (DataIntegrityViolationException exception) {
            if (hasExactViolation(exception, "23503", PAYOUT_BANK_RECIPIENT_FK)) {
                changeLogger.failure("bank-account-referenced", ErrorCode.BANK_ACCOUNT_IN_USE, account.customerId(),
                        bankAccountId, exception.getClass().getSimpleName(), PAYOUT_BANK_RECIPIENT_FK);
                throw new AppException(ErrorCode.BANK_ACCOUNT_IN_USE, exception);
            }
            logDatabaseFailure("bank-account-delete-integrity-failure", account.customerId(), bankAccountId, exception);
            throw exception;
        } catch (DataAccessException exception) {
            logDatabaseFailure("bank-account-delete-database-failure", account.customerId(), bankAccountId, exception);
            throw exception;
        } catch (AppException exception) {
            throw exception;
        } catch (RuntimeException exception) {
            logUnexpected("bank-account-delete-unexpected-failure", account.customerId(), bankAccountId, exception);
            throw exception;
        }
    }

    private Customer lockActiveOwner(CurrentAccount account) {
        statusLock.acquire();
        Customer owner = customers.findByIdForUpdate(account.customerId())
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

    private List<BankAccount> lockRows(long ownerId, Collection<Long> ids) {
        if (ids.isEmpty()) return List.of();
        List<BankAccount> result = bankAccounts.findOwnedByIdsForUpdate(ownerId, ids);
        // A row disappearing between discovery and lock is treated as not found, never widened to another owner.
        if (result.size() != ids.size()) throw notFound();
        return result;
    }

    private static java.util.Optional<BankAccount> findLocked(List<BankAccount> rows, long id) {
        return rows.stream().filter(row -> row.getId() == id).findFirst();
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

    private static ErrorCode exactUniqueConflict(Throwable exception) {
        if (hasExactViolation(exception, "23505", CUSTOMER_BANK_ACCOUNT_UNIQUE)) {
            return ErrorCode.BANK_ACCOUNT_ALREADY_EXISTS;
        }
        if (hasExactViolation(exception, "23505", DEFAULT_PER_CUSTOMER_UNIQUE)) {
            return ErrorCode.BANK_DEFAULT_CONFLICT;
        }
        return null;
    }

    static boolean hasExactViolation(Throwable failure, String expectedState, String expectedConstraint) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof SQLException sql && expectedState.equals(sql.getSQLState())
                    && expectedConstraint.equals(constraintName(current))) return true;
            if (current instanceof ConstraintViolationException violation
                    && expectedState.equals(violation.getSQLException() == null ? null : violation.getSQLException().getSQLState())
                    && expectedConstraint.equals(violation.getConstraintName())) return true;
        }
        return false;
    }

    private static String constraintName(Throwable failure) {
        if (failure instanceof ConstraintViolationException violation) return violation.getConstraintName();
        for (Throwable current = failure.getCause(); current != null; current = current.getCause()) {
            if (current instanceof ConstraintViolationException violation) return violation.getConstraintName();
        }
        return null;
    }

    private void logDatabaseFailure(String category, long actorId, Long bankAccountId, DataAccessException exception) {
        ErrorCode code = exception instanceof PessimisticLockingFailureException
                || exception instanceof DataAccessResourceFailureException || hasSqlState(exception, "55P03")
                ? ErrorCode.DEPENDENCY_UNAVAILABLE : ErrorCode.INTERNAL_ERROR;
        changeLogger.failure(category, code, actorId, bankAccountId,
                exception.getClass().getSimpleName(), null);
    }

    private static boolean hasSqlState(Throwable failure, String expectedState) {
        for (Throwable current = failure; current != null; current = current.getCause()) {
            if (current instanceof SQLException sql && expectedState.equals(sql.getSQLState())) return true;
        }
        return false;
    }

    private void logUnexpected(String category, long actorId, Long bankAccountId, RuntimeException exception) {
        changeLogger.failure(category, ErrorCode.INTERNAL_ERROR, actorId, bankAccountId,
                exception.getClass().getSimpleName(), null);
    }

    private record PayeeInput(String bankName, String accountNumber, String accountHolder, boolean makeDefault) { }
}
