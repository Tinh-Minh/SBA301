package com.carrental.service;

import com.carrental.dto.request.voucher.ChangeVoucherStatusRequest;
import com.carrental.dto.request.voucher.CreateVoucherRequest;
import com.carrental.dto.request.voucher.UpdateVoucherAdminRequest;
import com.carrental.dto.request.voucher.VoucherListQuery;
import com.carrental.dto.response.PageResponse;
import com.carrental.dto.response.VoucherResponse;
import com.carrental.security.CurrentAccount;

public interface VoucherService {
    VoucherResponse create(CurrentAccount actor, CreateVoucherRequest request);
    PageResponse<VoucherResponse> list(CurrentAccount actor, VoucherListQuery query);
    VoucherResponse get(CurrentAccount actor, long id);
    VoucherResponse update(CurrentAccount actor, long id, UpdateVoucherAdminRequest request);
    VoucherResponse changeStatus(CurrentAccount actor, long id, ChangeVoucherStatusRequest request);
}
