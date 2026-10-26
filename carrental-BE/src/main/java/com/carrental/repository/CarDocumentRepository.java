package com.carrental.repository;

import com.carrental.entity.CarDocument;
import com.carrental.enums.CarDocumentType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CarDocumentRepository extends JpaRepository<CarDocument, Long> {

    List<CarDocument> findAllByCarId(Long carId);

    Optional<CarDocument> findByIdAndCarId(Long id, Long carId);

    Optional<CarDocument> findByCarIdAndDocType(Long carId, CarDocumentType docType);
}
