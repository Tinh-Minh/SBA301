package com.carrental.repository;

import com.carrental.entity.Payout;
import com.carrental.enums.PayoutStatus;
import org.springframework.data.jpa.domain.Specification;

public final class PayoutSpecification {

    private PayoutSpecification() {}

    public static Specification<Payout> filter(Long recipientId, Long orderId, String status) {
        Specification<Payout> spec = (root, query, cb) -> cb.conjunction();

        if (recipientId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("recipient").get("id"), recipientId));
        }

        if (orderId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("order").get("id"), orderId));
        }

        if (status != null && !status.isBlank()) {
            try {
                PayoutStatus payoutStatus = PayoutStatus.valueOf(status.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), payoutStatus));
            } catch (IllegalArgumentException ignored) {}
        }

        return spec;
    }
}
