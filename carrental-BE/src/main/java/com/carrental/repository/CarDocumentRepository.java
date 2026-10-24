package com.carrental.repository;

import com.carrental.entity.CarDocument;
import com.carrental.enums.CarDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarDocumentRepository extends JpaRepository<CarDocument, Long> {

    List<CarDocument> findAllByCarId(Long carId);

    Optional<CarDocument> findByCarIdAndDocType(Long carId, CarDocumentType docType);
}
