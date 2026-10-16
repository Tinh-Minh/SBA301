package com.carrental.service;

import com.carrental.dto.request.customer.ChangeCustomerStatusRequest;
import com.carrental.dto.request.customer.CustomerListQuery;
import com.carrental.dto.request.customer.UpdateProfileRequest;
import com.carrental.dto.response.CustomerAdminResponse;
import com.carrental.dto.response.CustomerProfileResponse;
import com.carrental.dto.response.CustomerSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.security.CurrentAccount;

public interface CustomerService {
    CustomerProfileResponse getMe(CurrentAccount account);

    CustomerProfileResponse updateMe(CurrentAccount account, UpdateProfileRequest request);

    PageResponse<CustomerSummaryResponse> listCustomers(CustomerListQuery query);

    CustomerAdminResponse getCustomer(long id);

    CustomerAdminResponse changeCustomerStatus(CurrentAccount actor, long targetId, ChangeCustomerStatusRequest request);
}
