package com.carrental.repository.transaction;

import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import org.springframework.data.jpa.domain.Specification;

public final class TransactionSpecification {

    private TransactionSpecification() {}

    public static Specification<Transaction> filter(Long orderId, String transactionType, String status) {
        Specification<Transaction> spec = (root, query, cb) -> cb.conjunction();

        if (orderId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("order").get("id"), orderId));
        }

        if (transactionType != null && !transactionType.isBlank()) {
            try {
                TransactionType type = TransactionType.valueOf(transactionType.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("transactionType"), type));
            } catch (IllegalArgumentException ignored) {}
        }

        if (status != null && !status.isBlank()) {
            try {
                TransactionStatus txStatus = TransactionStatus.valueOf(status.toUpperCase());
                spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), txStatus));
            } catch (IllegalArgumentException ignored) {}
        }

        return spec;
    }
}
