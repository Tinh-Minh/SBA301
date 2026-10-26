package com.carrental.dto.request.auth;

import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.KycStatus;
import com.carrental.enums.Role;

import com.carrental.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import com.fasterxml.jackson.annotation.JsonAnySetter;
import tools.jackson.databind.JsonNode;

public final class RegisterRequest {

    @NotBlank(message = "Tên không được để trống")
    @Size(max = 150, message = "Tên tối đa 150 ký tự")
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 150, message = "Email tối đa 150 ký tự")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    @Pattern(regexp = "^(?:\\+84|0)[0-9]{8,14}$", message = "Số điện thoại không đúng định dạng")
    private String phone;

    @NotBlank(message = "Mật khẩu không được để trống")
    @ValidPassword(requireMinimumLength = true)
    private String password;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = AuthInputNormalizer.trimmed(fullName); }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = AuthInputNormalizer.email(email); }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = AuthInputNormalizer.trimmed(phone); }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    @JsonAnySetter
    public void rejectUnknownField(String ignoredName, JsonNode ignoredValue) {
        throw new IllegalArgumentException("Unknown authentication request field");
    }

    public Customer toEntity(String encodedPassword) {
        Customer customer = new Customer();
        customer.setFullName(AuthInputNormalizer.trimmed(fullName));
        customer.setEmail(AuthInputNormalizer.email(email));
        customer.setPhone(AuthInputNormalizer.trimmed(phone));
        customer.setPasswordHash(encodedPassword);
        customer.setRole(Role.CUSTOMER);
        customer.setStatus(CustomerStatus.ACTIVE);
        customer.setKycStatus(KycStatus.NONE);
        customer.setEmailVerified(false);
        return customer;
    }
}
