package com.carrental.service;

import com.carrental.dto.request.driver.ChangeDriverStatusRequest;
import com.carrental.dto.request.driver.DriverListQuery;
import com.carrental.dto.response.DriverEligibilityResponse;
import com.carrental.dto.response.DriverResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;

public interface DriverService {
    DriverResponse createForMe(CurrentAccount account);
    DriverResponse getMe(CurrentAccount account);
    DriverResponse getById(CurrentAccount account, long driverId);
    PageResponse<DriverResponse> list(CurrentAccount account, DriverListQuery query);
    DriverResponse changeStatus(CurrentAccount actor, long driverId, ChangeDriverStatusRequest request);
    DriverEligibilityResponse getMyEligibility(CurrentAccount account);
    DriverEligibilityResponse getEligibility(CurrentAccount account, long driverId);
}
