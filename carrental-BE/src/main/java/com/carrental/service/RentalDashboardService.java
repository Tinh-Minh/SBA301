package com.carrental.service;

import com.carrental.dto.request.booking.*;
import com.carrental.dto.response.booking.*;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

public interface RentalDashboardService {

    OwnerDashboardResponse owner();

    CustomerDashboardResponse customer();
}
