package com.carrental.security;

import com.carrental.entity.Customer;
import com.carrental.enums.CustomerStatus;
import com.carrental.repository.CustomerRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.core.convert.converter.Converter;
import org.springframework.dao.DataAccessException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;

public class CurrentAccountJwtAuthenticationConverter implements Converter<Jwt, UsernamePasswordAuthenticationToken> {

    private final CustomerRepository customers;

    public CurrentAccountJwtAuthenticationConverter(CustomerRepository customers) {
        this.customers = customers;
    }

    @Override
    public UsernamePasswordAuthenticationToken convert(Jwt jwt) {
        if ("email_verification".equals(jwt.getClaimAsString("purpose"))) {
            throw new InvalidCurrentAccountException();
        }
        long customerId;
        try {
            customerId = Long.parseLong(jwt.getSubject());
        } catch (RuntimeException exception) {
            throw new InvalidCurrentAccountException();
        }
        Customer customer;
        try {
            customer = customers.findById(customerId).orElseThrow(InvalidCurrentAccountException::new);
        } catch (DataAccessException exception) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("dependency_unavailable", "Current account lookup is unavailable", null), exception);
        }
        if (customer.getStatus() != CustomerStatus.ACTIVE || customer.getRole() == null) {
            throw new InvalidCurrentAccountException();
        }
        // Token cấp trước lần đổi mật khẩu gần nhất không còn hiệu lực
        if (customer.getPasswordChangedAt() != null) {
            long currentPwdEpoch = customer.getPasswordChangedAt()
                    .atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).toEpochSecond();
            Object tokenPca = jwt.getClaims().get("pca");
            if (tokenPca instanceof Number num) {
                if (num.longValue() < currentPwdEpoch) {
                    throw new InvalidCurrentAccountException();
                }
            } else if (jwt.getIssuedAt() != null) {
                Instant pwdChangedInstant = customer.getPasswordChangedAt()
                        .atZone(java.time.ZoneId.of("Asia/Ho_Chi_Minh")).toInstant();
                if (jwt.getIssuedAt().isBefore(pwdChangedInstant)) {
                    throw new InvalidCurrentAccountException();
                }
            }
        }
        CurrentAccount principal = new CurrentAccount(customerId, customer.getRole());
        return UsernamePasswordAuthenticationToken.authenticated(principal, null,
                List.of(new SimpleGrantedAuthority("ROLE_" + customer.getRole().name())));
    }
}
