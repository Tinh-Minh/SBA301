package com.carrental.dto.response;

import com.carrental.enums.RentalType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Kết quả tính tiền một lần thuê.
 *
 * @param unitPrice giá/giờ hoặc giá/ngày lấy từ slot
 * @param quantity  số giờ hoặc số ngày (đã làm tròn lên)
 */
public record PriceQuoteResponse(
        Long carSlotId,
        RentalType rentalType,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal unitPrice,
        Integer quantity,
        BigDecimal rentalAmount,
        BigDecimal discountAmount,
        BigDecimal totalAmount,
        BigDecimal depositAmount,
        Long voucherId,
        String voucherCode) {
}
