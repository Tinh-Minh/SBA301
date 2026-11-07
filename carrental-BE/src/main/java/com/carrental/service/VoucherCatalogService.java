package com.carrental.service;

import com.carrental.dto.response.VoucherCatalogResponse;
import com.carrental.security.CurrentAccount;
import java.util.List;

public interface VoucherCatalogService {
    List<VoucherCatalogResponse> listAvailableForPackage(CurrentAccount actor, long packageId);
}
