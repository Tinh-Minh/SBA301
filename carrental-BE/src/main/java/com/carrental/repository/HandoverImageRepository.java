package com.carrental.repository;

import com.carrental.entity.HandoverImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HandoverImageRepository extends JpaRepository<HandoverImage, Long> {

    List<HandoverImage> findByHandoverIdOrderByIdAsc(Long handoverId);
}
