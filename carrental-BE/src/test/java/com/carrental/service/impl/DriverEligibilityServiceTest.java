package com.carrental.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.dto.response.DriverEligibilityReasonCode;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.DriverStatus;
import com.carrental.enums.KycStatus;
import org.junit.jupiter.api.Test;

class DriverEligibilityServiceTest {

    @Test
    void currentReasonUsesDefinedPrecedenceAndStoredStatusDoesNotReplaceCurrentEvidence() {
        assertThat(DriverEligibilityServiceImpl.currentReason(CustomerStatus.LOCKED, null, KycStatus.NONE, false))
                .isEqualTo(DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE);
        assertThat(DriverEligibilityServiceImpl.currentReason(CustomerStatus.ACTIVE, null, KycStatus.NONE, false))
                .isEqualTo(DriverEligibilityReasonCode.DRIVER_PROFILE_MISSING);
        assertThat(DriverEligibilityServiceImpl.currentReason(CustomerStatus.ACTIVE, DriverStatus.PENDING, KycStatus.VERIFIED, true))
                .isEqualTo(DriverEligibilityReasonCode.DRIVER_NOT_ACTIVE);
        assertThat(DriverEligibilityServiceImpl.currentReason(CustomerStatus.ACTIVE, DriverStatus.ACTIVE, KycStatus.PENDING, true))
                .isEqualTo(DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED);
        assertThat(DriverEligibilityServiceImpl.currentReason(CustomerStatus.ACTIVE, DriverStatus.ACTIVE, KycStatus.VERIFIED, false))
                .isEqualTo(DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED);
        assertThat(DriverEligibilityServiceImpl.currentReason(CustomerStatus.ACTIVE, DriverStatus.ACTIVE, KycStatus.VERIFIED, true))
                .isNull();
    }

    @Test
    void activationChecksAccountCurrentIdentityAndLicenseButDoesNotRequireStoredActiveProfile() {
        assertThat(DriverServiceImpl.activationFailure(CustomerStatus.ACTIVE, KycStatus.VERIFIED, true)).isNull();
        assertThat(DriverServiceImpl.activationFailure(CustomerStatus.LOCKED, KycStatus.VERIFIED, true))
                .isEqualTo(DriverEligibilityReasonCode.ACCOUNT_NOT_ACTIVE);
        assertThat(DriverServiceImpl.activationFailure(CustomerStatus.ACTIVE, KycStatus.PENDING, true))
                .isEqualTo(DriverEligibilityReasonCode.IDENTITY_NOT_VERIFIED);
        assertThat(DriverServiceImpl.activationFailure(CustomerStatus.ACTIVE, KycStatus.VERIFIED, false))
                .isEqualTo(DriverEligibilityReasonCode.VALID_DRIVER_LICENSE_REQUIRED);
    }
}
