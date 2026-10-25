package com.carrental.service.impl;

import com.carrental.dto.request.auth.AuthInputNormalizer;
import com.carrental.entity.Customer;
import com.carrental.repository.CustomerRepository;
import com.carrental.security.AccountUserDetails;
import java.util.regex.Pattern;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomerUserDetailsServiceImpl implements UserDetailsService {
    private static final Pattern SUPPORTED_BCRYPT_HASH = Pattern.compile(
            "^\\{bcrypt}\\$2[aby]\\$(0[4-9]|[12][0-9]|3[01])\\$[./A-Za-z0-9]{53}$");

    private final CustomerRepository customers;

    public CustomerUserDetailsServiceImpl(CustomerRepository customers) {
        this.customers = customers;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Customer customer = customers.findByEmailIgnoreCase(AuthInputNormalizer.email(username))
                .orElseThrow(() -> new UsernameNotFoundException("Account credentials were not accepted"));
        if (customer.getPasswordHash() == null || !SUPPORTED_BCRYPT_HASH.matcher(customer.getPasswordHash()).matches()) {
            throw new UsernameNotFoundException("Account credentials were not accepted");
        }
        return AccountUserDetails.from(customer);
    }
}
