package com.carrental.service;

import com.carrental.dto.response.PriceQuoteDTO;
import com.carrental.entity.CarSlot;
import com.carrental.entity.Voucher;
import com.carrental.enums.RentalType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Tính tiền thuê xe: số giờ/ngày (làm tròn lên), áp voucher, tiền cọc. */
public interface PricingService {

    /**
     * Kiểm tra khoảng thuê hợp lệ với slot rồi tính tiền.
     *
     * @param voucherCode có thể null/rỗng
     * @param customerId  người thuê, dùng để kiểm tra giới hạn lượt dùng voucher mỗi người
     */
    PriceQuoteDTO quote(CarSlot slot, RentalType rentalType, LocalDateTime startTime, LocalDateTime endTime,
                        String voucherCode, Long customerId);

    /** Kiểm tra khoảng thuê có nằm trong slot, đúng hình thức thuê, đủ giờ tối thiểu, slot/xe còn mở. */
    void validateBookingWindow(CarSlot slot, RentalType rentalType, LocalDateTime startTime, LocalDateTime endTime);

    /** Số giờ (HOURLY) hoặc số ngày 24h (DAILY), làm tròn lên. */
    int calculateQuantity(RentalType rentalType, LocalDateTime startTime, LocalDateTime endTime);

    /** Số tiền được giảm (không vượt quá tiền thuê). */
    BigDecimal calculateDiscount(Voucher voucher, BigDecimal rentalAmount);

    /** Tìm và kiểm tra voucher còn dùng được cho đơn này; trả null nếu không nhập mã. */
    Voucher resolveVoucher(String voucherCode, BigDecimal rentalAmount, Long customerId);
}
