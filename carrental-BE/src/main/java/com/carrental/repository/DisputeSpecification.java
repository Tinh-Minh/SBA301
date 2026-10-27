package com.carrental.repository;

import com.carrental.entity.Dispute;
import com.carrental.enums.DisputeStatus;
import org.springframework.data.jpa.domain.Specification;

public final class DisputeSpecification {

    private DisputeSpecification() {}

    public static Specification<Dispute> filter(Long orderId, Long raisedById, String status) {
        Specification<Dispute> spec = (root, query, cb) -> cb.conjunction();

        if (orderId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("order").get("id"), orderId));
        }

        if (raisedById != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("raisedBy").get("id"), raisedById));
        }

        if (status != null && !status.isBlank()) {
            try {
                DisputeStatus disputeStatus = DisputeStatus.valueOf(status.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), disputeStatus));
            } catch (IllegalArgumentException ignored) {}
        }

        return spec;
    }
}
