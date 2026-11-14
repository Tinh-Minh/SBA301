package com.carrental.service;

import com.carrental.entity.Booking;
import com.carrental.entity.SettlementSlip;
import com.carrental.entity.SettlementSlip.SlipStatus;
import com.carrental.entity.SettlementSlip.SlipType;
import java.math.BigDecimal;
import java.util.List;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

public interface SettlementService {

    SettlementSlip refundCustomer(Booking b, BigDecimal amount, String reason);

    SettlementSlip penalizeOwner(Booking b, BigDecimal amount, String reason);

    SettlementSlip payOwner(Booking b, BigDecimal gross, String reason);

    List<SlipResponse> mine();

    List<SlipResponse> forBooking(Long bookingId);

    List<SlipResponse> adminList(SlipType type, SlipStatus status);

    SlipResponse complete(Long id, String referenceCode, String note);
}
