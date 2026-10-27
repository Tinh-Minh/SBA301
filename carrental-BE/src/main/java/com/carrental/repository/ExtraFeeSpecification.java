package com.carrental.repository;

import com.carrental.entity.ExtraFee;
import com.carrental.enums.ExtraFeeStatus;
import org.springframework.data.jpa.domain.Specification;

public final class ExtraFeeSpecification {

    private ExtraFeeSpecification() {}

    public static Specification<ExtraFee> filter(Long orderId, String status) {
        Specification<ExtraFee> spec = (root, query, cb) -> cb.conjunction();

        if (orderId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("order").get("id"), orderId));
        }

        if (status != null && !status.isBlank()) {
            try {
                ExtraFeeStatus feeStatus = ExtraFeeStatus.valueOf(status.trim().toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), feeStatus));
            } catch (IllegalArgumentException ignored) {}
        }

        return spec;
    }
}
