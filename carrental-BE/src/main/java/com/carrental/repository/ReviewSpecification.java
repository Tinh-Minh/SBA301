package com.carrental.repository;

import com.carrental.entity.Review;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ReviewSpecification {

    public static Specification<Review> filter(Long carId, Long customerId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (carId != null) {
                predicates.add(cb.equal(root.get("car").get("id"), carId));
            }
            if (customerId != null) {
                predicates.add(cb.equal(root.get("customer").get("id"), customerId));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
