package com.carrental.service;

import com.carrental.entity.Customer;
import com.carrental.exception.AppException;
import com.carrental.repository.CustomerRepository;
import java.text.Normalizer;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tài khoản ngân hàng của người dùng: khách nhận tiền hoàn cọc, chủ xe nhận tiền thuê.
 * Tên chủ tài khoản phải trùng họ tên của người dùng (không phân biệt dấu/hoa thường)
 * để tránh chuyển tiền vào tài khoản người khác.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BankAccountService {

    public record BankAccountRequest(String accountNumber, String bankName, String bankBranch, String accountHolder) {}

    public record BankAccountResponse(boolean configured, String accountNumber, String bankName, String bankBranch,
                                      String accountHolder) {
        public static BankAccountResponse from(Customer c) {
            return new BankAccountResponse(c.hasBankAccount(), c.getBankAccountNumber(), c.getBankName(),
                    c.getBankBranch(), c.getBankAccountHolder());
        }
    }

    private final CustomerRepository customerRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public BankAccountResponse mine() {
        return BankAccountResponse.from(currentUserService.getCurrentUser());
    }

    @Transactional
    public BankAccountResponse update(BankAccountRequest request) {
        Customer customer = currentUserService.getCurrentUser();
        if (request == null) {
            throw bad("Vui lòng nhập thông tin tài khoản ngân hàng");
        }
        String number = trim(request.accountNumber());
        String bank = trim(request.bankName());
        String branch = trim(request.bankBranch());
        String holder = trim(request.accountHolder());
        if (number == null || !number.matches("^[0-9]{6,20}$")) {
            throw bad("Số tài khoản chỉ gồm chữ số, từ 6 đến 20 ký tự");
        }
        if (bank == null || bank.length() > 100) {
            throw bad("Vui lòng nhập tên ngân hàng (tối đa 100 ký tự)");
        }
        if (branch == null || branch.length() > 150) {
            throw bad("Vui lòng nhập chi nhánh / phòng giao dịch (tối đa 150 ký tự)");
        }
        if (holder == null || holder.length() > 150) {
            throw bad("Vui lòng nhập tên chủ tài khoản (tối đa 150 ký tự)");
        }
        if (!normalizeName(holder).equals(normalizeName(customer.getFullName()))) {
            throw bad("Tên chủ tài khoản phải trùng với họ tên của bạn (" + customer.getFullName() + ")");
        }
        customer.setBankAccountNumber(number);
        customer.setBankName(bank);
        customer.setBankBranch(branch);
        customer.setBankAccountHolder(normalizeName(holder));
        log.info("Cập nhật tài khoản ngân hàng customerId={}", customer.getId());
        return BankAccountResponse.from(customerRepository.save(customer));
    }

    /** Bắt buộc có tài khoản ngân hàng trước khi phát sinh tiền cần hoàn/chi trả. */
    public static void requireBankAccount(Customer customer, String purpose) {
        if (!customer.hasBankAccount()) {
            throw new AppException(HttpStatus.BAD_REQUEST,
                    "Vui lòng cập nhật tài khoản ngân hàng (số tài khoản, ngân hàng, chi nhánh, chủ tài khoản) " + purpose);
        }
    }

    /** Bỏ dấu tiếng Việt, viết hoa, gộp khoảng trắng: "Nguyễn Văn A" -> "NGUYEN VAN A". */
    static String normalizeName(String value) {
        if (value == null) {
            return "";
        }
        String noAccent = Normalizer.normalize(value.replace('đ', 'd').replace('Đ', 'D'), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return noAccent.trim().replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }

    private static String trim(String value) {
        return value == null || value.trim().isEmpty() ? null : value.trim();
    }

    private static AppException bad(String message) {
        return new AppException(HttpStatus.BAD_REQUEST, message);
    }
}
