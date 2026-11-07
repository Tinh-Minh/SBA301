package com.carrental.dto.response;

import com.carrental.enums.RentalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Kết quả tính tiền một lần thuê. */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PriceQuoteDTO {

    private Long carSlotId;
    private RentalType rentalType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    /** Giá/giờ hoặc giá/ngày lấy từ slot. */
    private BigDecimal unitPrice;
    /** Số giờ hoặc số ngày (đã làm tròn lên). */
    private Integer quantity;
    private BigDecimal rentalAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private BigDecimal depositAmount;
    private Long voucherId;
    private String voucherCode;
}
