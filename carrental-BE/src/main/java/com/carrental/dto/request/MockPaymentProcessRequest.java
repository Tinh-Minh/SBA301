package com.carrental.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MockPaymentProcessRequest {
    private boolean simulateSuccess = true;
    private String providerRef;
}
