package com.carrental.security;

import com.carrental.entity.Customer;
import java.util.Collection;
import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/** Password-login view that never exposes the JPA entity as a principal. */
public final class AccountUserDetails implements UserDetails {

    private final Long customerId;
    private final String email;
    private final String fullName;
    private final String passwordHash;
    private final boolean active;
    private final com.carrental.enums.Role role;

    private AccountUserDetails(Customer customer) {
        customerId = customer.getId();
        email = customer.getEmail();
        fullName = customer.getFullName();
        passwordHash = customer.getPasswordHash();
        active = customer.getStatus() == com.carrental.enums.CustomerStatus.ACTIVE;
        role = customer.getRole();
    }

    public static AccountUserDetails from(Customer customer) { return new AccountUserDetails(customer); }
    public Long customerId() { return customerId; }
    public String fullName() { return fullName; }
    public com.carrental.enums.Role role() { return role; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return active; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return active; }

    @Override
    public String toString() {
        return "AccountUserDetails[customerId=" + customerId + ", credentials=<redacted>]";
    }
}
