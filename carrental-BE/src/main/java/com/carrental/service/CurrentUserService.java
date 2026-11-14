package com.carrental.service;

import com.carrental.entity.Car;
import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;
import com.carrental.exception.AppException;
import java.util.Optional;
import org.springframework.http.HttpStatus;

/**
 * Người dùng của request hiện tại, lấy từ JWT trong SecurityContext.
 * Header X-User-Id không còn được dùng làm danh tính.
 */
public interface CurrentUserService {

    /** @throws com.carrental.exception.AppException nếu chưa đăng nhập hoặc tài khoản bị khoá */
    Customer getCurrentUser();

    Optional<Customer> optionalCurrentUser();

    boolean isAdmin(Customer customer);

    boolean isOwner(Car car, Customer customer);

    static boolean isVerifiedOwnerAccount(Customer customer) {
        return customer != null
                && customer.getStatus() == CustomerStatus.ACTIVE
                && customer.getRole() == Role.OWNER
                && customer.getKycStatus() == KycStatus.VERIFIED;
    }

    /**
     * Được đăng ký xe: tài khoản đang hoạt động, CCCD/Hộ chiếu đã duyệt, là Khách hàng hoặc Chủ xe.
     * Khách hàng đăng xe đầu tiên và được Admin duyệt xe thì tự động lên Chủ xe.
     */
    static boolean canRegisterCars(Customer customer) {
        return customer != null
                && customer.getStatus() == CustomerStatus.ACTIVE
                && (customer.getRole() == Role.OWNER || customer.getRole() == Role.CUSTOMER)
                && customer.getKycStatus() == KycStatus.VERIFIED;
    }

    static void requireCarRegistrant(Customer customer) {
        if (!canRegisterCars(customer)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Bạn cần được Admin duyệt CCCD/Hộ chiếu trước khi đăng ký xe");
        }
    }

    static void requireVerifiedOwner(Customer customer) {
        if (!isVerifiedOwnerAccount(customer)) {
            throw new AppException(HttpStatus.FORBIDDEN,
                    "Tài khoản chưa gửi giấy xác nhận và được Admin duyệt làm Chủ xe nên không thể thực hiện chức năng này");
        }
    }
}
