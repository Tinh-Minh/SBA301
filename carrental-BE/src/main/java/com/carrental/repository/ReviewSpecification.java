package com.carrental.repository;

import com.carrental.entity.Review;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ReviewSpecification {

    public static Specification<Review> filter(Long orderId, Long revieweeId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (orderId != null) {
                predicates.add(cb.equal(root.get("order").get("id"), orderId));
            }
            if (revieweeId != null) {
                predicates.add(cb.equal(root.get("reviewee").get("id"), revieweeId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
