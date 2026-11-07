package com.carrental.config.security;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

class BCryptPasswordEncoderTest {

    @Test
    void encodesAndMatchesPlainBcryptAndRejectsPrefixedHash() {
        PasswordEncoder encoder = new SecurityConfiguration()
                .passwordEncoder(new PasswordPolicyProperties(8, 72, 4));
        String password = "test-only-password";
        String encoded = encoder.encode(password);

        assertThat(encoded).matches("^\\$2[aby]\\$04\\$[./A-Za-z0-9]{53}$");
        assertThat(encoder.matches(password, encoded)).isTrue();

        assertThat(encoder.matches("wrong-password", encoded)).isFalse();
        assertThat(encoder.matches(password, "{bcrypt}" + encoded)).isFalse();
    }
}
