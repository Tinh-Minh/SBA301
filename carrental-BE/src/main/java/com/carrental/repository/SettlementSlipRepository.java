package com.carrental.repository;

import com.carrental.entity.SettlementSlip;
import com.carrental.entity.SettlementSlip.SlipStatus;
import com.carrental.entity.SettlementSlip.SlipType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SettlementSlipRepository extends JpaRepository<SettlementSlip, Long>, JpaSpecificationExecutor<SettlementSlip> {

    List<SettlementSlip> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    List<SettlementSlip> findByRecipientIdAndSlipTypeAndStatusOrderByCreatedAtAsc(Long recipientId, SlipType type, SlipStatus status);

    List<SettlementSlip> findByBookingIdOrderByCreatedAtAsc(Long bookingId);

    boolean existsBySlipCode(String slipCode);
}
