package com.carrental.repository;

import com.carrental.entity.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

/**
 * TẠM THỜI cho Function 3 - Function 1 sẽ thay bằng repository đầy đủ
 * (nhớ giữ lại 2 hàm increaseUsage / decreaseUsage mà Function 3 đang dùng).
 */
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    /**
     * Tăng lượt dùng một cách nguyên tử, chỉ thành công khi còn lượt.
     * Trả về 0 nếu voucher đã hết lượt (do người khác vừa dùng hết).
     */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update Voucher v set v.usedCount = v.usedCount + 1
            where v.id = :id and (v.usageLimit is null or v.usedCount < v.usageLimit)
            """)
    int increaseUsage(@Param("id") Long id);

    /** Trả lại một lượt dùng khi đơn bị huỷ/từ chối/hết hạn. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("update Voucher v set v.usedCount = v.usedCount - 1 where v.id = :id and v.usedCount > 0")
    int decreaseUsage(@Param("id") Long id);
}
