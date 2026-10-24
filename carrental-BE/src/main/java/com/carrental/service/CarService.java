package com.carrental.service;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;
import com.carrental.entity.Car;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CarService {

    CarResponse createCar(Long ownerId, CarCreateRequest request);

    CarResponse updateCar(Long ownerId, Long carId, CarUpdateRequest request);

    CarResponse getCarById(Long carId, Long requesterId);

    PageResponse<CarSummaryResponse> getMyCars(Long ownerId, CarStatus status, Pageable pageable);

    PageResponse<CarSummaryResponse> getCarsByStatus(Long adminId, CarStatus status, Pageable pageable);

    CarResponse updateCarStatusByOwner(Long ownerId, Long carId, CarStatus status);

    PageResponse<CarSummaryResponse> searchCars(
            String city,
            CarType carType,
            String brand,
            Integer seats,
            Pageable pageable
    );

    CarResponse approveCar(Long adminId, Long carId);

    CarResponse rejectCar(Long adminId, Long carId, String reason);

    // Car Images
    List<CarImageResponse> addCarImages(Long ownerId, Long carId, List<CarImageRequest> requests);

    void deleteCarImage(Long ownerId, Long carId, Long imageId);

    CarImageResponse setPrimaryCarImage(Long ownerId, Long carId, Long imageId);

    // Car Documents
    CarDocumentResponse addCarDocument(Long ownerId, Long carId, CarDocumentRequest request);

    List<CarDocumentResponse> getCarDocuments(Long requesterId, Long carId);

    CarDocumentResponse verifyCarDocumentByAdmin(Long adminId, Long carId, Long documentId, CarDocumentVerifyRequest request);

    // Method tiện ích cho Người 3
    Car findCarOrThrow(Long carId);
}
