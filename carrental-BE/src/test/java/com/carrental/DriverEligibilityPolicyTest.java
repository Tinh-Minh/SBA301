package com.carrental;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.dto.response.DriverEligibilityReasonCode;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import com.carrental.service.DriverEligibilityPolicy;
import org.junit.jupiter.api.Test;

class DriverEligibilityPolicyTest {
    private final DriverEligibilityPolicy policy = new DriverEligibilityPolicy();

    @Test
    void currentReasonUsesDefinedPrecedenceAndStoredStatusDoesNotReplaceCurrentEvidence() {
        assertThat(policy.currentReason(CustomerStatus.LOCKED, null, KycStatus.NONE, false))
                .isEqualTo(DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE);
        assertThat(policy.currentReason(CustomerStatus.ACTIVE, null, KycStatus.NONE, false))
                .isEqualTo(DriverEligibilityReasonCode.DRIVER_PROFILE_MISSING);
        assertThat(policy.currentReason(CustomerStatus.ACTIVE, DriverStatus.PENDING, KycStatus.VERIFIED, true))
                .isEqualTo(DriverEligibilityReasonCode.DRIVER_NOT_ACTIVE);
        assertThat(policy.currentReason(CustomerStatus.ACTIVE, DriverStatus.ACTIVE, KycStatus.PENDING, true))
                .isEqualTo(DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED);
        assertThat(policy.currentReason(CustomerStatus.ACTIVE, DriverStatus.ACTIVE, KycStatus.VERIFIED, false))
                .isEqualTo(DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED);
        assertThat(policy.currentReason(CustomerStatus.ACTIVE, DriverStatus.ACTIVE, KycStatus.VERIFIED, true))
                .isNull();
    }

    @Test
    void activationChecksAccountCurrentIdentityAndLicenseButDoesNotRequireStoredActiveProfile() {
        assertThat(policy.activationFailure(CustomerStatus.ACTIVE, KycStatus.VERIFIED, true)).isNull();
        assertThat(policy.activationFailure(CustomerStatus.LOCKED, KycStatus.VERIFIED, true))
                .isEqualTo(DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE);
        assertThat(policy.activationFailure(CustomerStatus.ACTIVE, KycStatus.PENDING, true))
                .isEqualTo(DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED);
        assertThat(policy.activationFailure(CustomerStatus.ACTIVE, KycStatus.VERIFIED, false))
                .isEqualTo(DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED);
    }
}
