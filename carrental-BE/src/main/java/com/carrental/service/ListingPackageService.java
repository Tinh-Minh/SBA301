package com.carrental.service;

import com.carrental.dto.request.listingpackage.ListingPackageCreateRequest;
import com.carrental.dto.request.listingpackage.ListingPackageUpdateRequest;
import com.carrental.dto.response.ListingPackageResponse;
import com.carrental.security.CurrentAccount;
import java.util.List;

public interface ListingPackageService {
    List<ListingPackageResponse> getPublicActivePackages();

    List<ListingPackageResponse> listAdminPackages(CurrentAccount actor);

    ListingPackageResponse getAdminPackage(CurrentAccount actor, long id);

    ListingPackageResponse createPackage(CurrentAccount actor, ListingPackageCreateRequest request);

    ListingPackageResponse updatePackage(CurrentAccount actor, long id, ListingPackageUpdateRequest request);
}
