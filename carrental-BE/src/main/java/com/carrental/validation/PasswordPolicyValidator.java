package com.carrental.validation;

import com.carrental.config.security.PasswordPolicyProperties;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.nio.charset.StandardCharsets;
import org.springframework.stereotype.Component;

@Component
public class PasswordPolicyValidator implements ConstraintValidator<ValidPassword, String> {

    private final PasswordPolicyProperties policy;
    private boolean requireMinimumLength;

    public PasswordPolicyValidator(PasswordPolicyProperties policy) {
        this.policy = policy;
    }

    @Override
    public void initialize(ValidPassword annotation) {
        requireMinimumLength = annotation.requireMinimumLength();
    }

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) {
            return true;
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > policy.maxUtf8Bytes()) {
            return false;
        }
        return !requireMinimumLength || password.codePointCount(0, password.length()) >= policy.minLength();
    }
}
