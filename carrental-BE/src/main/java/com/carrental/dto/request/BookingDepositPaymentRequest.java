package com.carrental.dto.request;

import com.carrental.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record BookingDepositPaymentRequest(
        @NotNull(message = "Thiếu id đơn thuê") Long bookingId,
        @NotNull(message = "Thiếu phương thức thanh toán") PaymentMethod method,
        String bankCode
) {}
