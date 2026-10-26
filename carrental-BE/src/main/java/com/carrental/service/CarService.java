package com.carrental.service;

import com.carrental.dto.request.CarCreateRequest;
import com.carrental.dto.request.CarDocumentRequest;
import com.carrental.dto.request.CarDocumentVerifyRequest;
import com.carrental.dto.request.CarImageRequest;
import com.carrental.dto.request.CarUpdateRequest;
import com.carrental.dto.response.CarDocumentResponse;
import com.carrental.dto.response.CarImageResponse;
import com.carrental.dto.response.CarResponse;
import com.carrental.dto.response.CarSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CarService {

    CarResponse createCar(CarCreateRequest request);

    CarResponse updateCar(Long carId, CarUpdateRequest request);

    CarResponse getCarById(Long carId);

    PageResponse<CarSummaryResponse> getMyCars(CarStatus status, Pageable pageable);

    PageResponse<CarSummaryResponse> getCarsByStatus(CarStatus status, Pageable pageable);

    CarResponse updateCarStatusByOwner(Long carId, CarStatus status);

    PageResponse<CarSummaryResponse> searchCars(
            String city,
            CarType carType,
            String brand,
            Integer seats,
            Pageable pageable
    );

    CarResponse approveCar(Long carId);

    CarResponse rejectCar(Long carId, String reason);

    // Car Images
    List<CarImageResponse> addCarImages(Long carId, List<CarImageRequest> requests);

    void deleteCarImage(Long carId, Long imageId);

    CarImageResponse setPrimaryCarImage(Long carId, Long imageId);

    // Car Documents
    CarDocumentResponse addCarDocument(Long carId, CarDocumentRequest request);

    List<CarDocumentResponse> getCarDocuments(Long carId);

    CarDocumentResponse verifyCarDocumentByAdmin(Long carId, Long documentId, CarDocumentVerifyRequest request);
}
