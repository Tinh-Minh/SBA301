package com.carrental.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SimulateGatewayRequest {
    private Boolean simulateSuccess = true;
    private String providerRef;
}
