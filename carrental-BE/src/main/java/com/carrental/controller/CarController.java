package com.carrental.controller;

import com.carrental.dto.request.CarCreateRequest;
import com.carrental.dto.request.CarDocumentRequest;
import com.carrental.dto.request.CarImageRequest;
import com.carrental.dto.request.CarUpdateRequest;
import com.carrental.dto.response.ApiResponse;
import com.carrental.dto.response.CarDocumentResponse;
import com.carrental.dto.response.CarImageResponse;
import com.carrental.dto.response.CarResponse;
import com.carrental.dto.response.CarSummaryResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.ListingStatus;
import com.carrental.service.CarService;
import com.carrental.util.PageRequestFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/cars")
@RequiredArgsConstructor
public class CarController {

    private final CarService carService;

    private static final Set<String> ALLOWED_CAR_SORT_FIELDS = Set.of(
            "createdAt", "rentalPricePerDay", "rentalPricePerMonth", "brand", "seats"
    );

    // Khách vãng lai xem chi tiết xe (ẩn biển số, giấy tờ; chủ xe/admin xem đầy đủ)
    @GetMapping("/{id}")
    public ApiResponse<CarResponse> getCarById(@PathVariable Long id) {
        return ApiResponse.ok(carService.getCarById(id));
    }

    // Khách vãng lai tìm kiếm xe kèm bộ lọc và phân trang an toàn
    @GetMapping("/search")
    public ApiResponse<PageResponse<CarSummaryResponse>> searchCars(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) CarType carType,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        validateSearchParams(page, size, sortBy, direction, seats, minPrice, maxPrice);
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, ALLOWED_CAR_SORT_FIELDS, "createdAt");
        // API công khai luôn chỉ trả xe đang hiển thị (LISTED): không nhận listingStatus từ client
        // để tránh lộ xe UNLISTED/EXPIRED ra ngoài.
        return ApiResponse.ok(carService.searchCars(city, carType, brand, seats, minPrice, maxPrice, ListingStatus.LISTED, pageable));
    }

    /** Từ chối tham số tìm kiếm vô nghĩa thay vì âm thầm bỏ qua. */
    static void validateSearchParams(int page, int size, String sortBy, String direction,
                                     Integer seats, BigDecimal minPrice, BigDecimal maxPrice) {
        if (page < 0) {
            throw badParam("Số trang (page) phải từ 0 trở lên");
        }
        if (size < 1) {
            throw badParam("Kích thước trang (size) phải từ 1 trở lên");
        }
        if (sortBy != null && !ALLOWED_CAR_SORT_FIELDS.contains(sortBy)) {
            throw badParam("Không hỗ trợ sắp xếp theo '" + sortBy + "'");
        }
        if (direction != null && !direction.equalsIgnoreCase("ASC") && !direction.equalsIgnoreCase("DESC")) {
            throw badParam("Chiều sắp xếp (direction) chỉ nhận ASC hoặc DESC");
        }
        if (seats != null && seats < 1) {
            throw badParam("Số chỗ phải từ 1 trở lên");
        }
        if ((minPrice != null && minPrice.signum() < 0) || (maxPrice != null && maxPrice.signum() < 0)) {
            throw badParam("Khoảng giá không được âm");
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw badParam("Giá tối thiểu không được lớn hơn giá tối đa");
        }
    }

    private static com.carrental.exception.AppException badParam(String message) {
        return new com.carrental.exception.AppException(org.springframework.http.HttpStatus.BAD_REQUEST, message);
    }

    // Chủ xe xem danh sách xe của mình (hỗ trợ lọc status và listingStatus)
    @PreAuthorize("hasRole('OWNER')")
    @GetMapping("/my-cars")
    public ApiResponse<PageResponse<CarSummaryResponse>> getMyCars(
            @RequestParam(required = false) CarStatus status,
            @RequestParam(required = false) ListingStatus listingStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Pageable pageable = PageRequestFactory.of(page, size, sortBy, direction, ALLOWED_CAR_SORT_FIELDS, "createdAt");
        return ApiResponse.ok(carService.getMyCars(status, listingStatus, pageable));
    }

    // Chủ xe đăng ký xe mới
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping
    public ApiResponse<CarResponse> createCar(
            @Valid @RequestBody CarCreateRequest request
    ) {
        return ApiResponse.ok("Đăng ký xe thành công, chờ admin duyệt", carService.createCar(request));
    }

    // Chủ xe cập nhật thông tin xe
    @PreAuthorize("hasRole('OWNER')")
    @PutMapping("/{id}")
    public ApiResponse<CarResponse> updateCar(
            @PathVariable Long id,
            @Valid @RequestBody CarUpdateRequest request
    ) {
        return ApiResponse.ok("Cập nhật thông tin xe thành công", carService.updateCar(id, request));
    }

    // Chủ xe tạm dừng hoặc kích hoạt lại xe (ACTIVE <-> INACTIVE)
    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{id}/status")
    public ApiResponse<CarResponse> updateCarStatus(
            @PathVariable Long id,
            @RequestParam CarStatus status
    ) {
        return ApiResponse.ok("Cập nhật trạng thái xe thành công", carService.updateCarStatusByOwner(id, status));
    }

    // Tải lên danh sách ảnh xe
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/{id}/images")
    public ApiResponse<List<CarImageResponse>> addCarImages(
            @PathVariable Long id,
            @Valid @RequestBody List<CarImageRequest> requests
    ) {
        return ApiResponse.ok("Tải ảnh xe thành công", carService.addCarImages(id, requests));
    }

    // Xoá một ảnh xe
    @PreAuthorize("hasRole('OWNER')")
    @DeleteMapping("/{id}/images/{imageId}")
    public ApiResponse<Void> deleteCarImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        carService.deleteCarImage(id, imageId);
        return ApiResponse.ok("Xoá ảnh thành công", null);
    }

    // Chọn ảnh đại diện chính cho xe
    @PreAuthorize("hasRole('OWNER')")
    @PatchMapping("/{id}/images/{imageId}/primary")
    public ApiResponse<CarImageResponse> setPrimaryCarImage(
            @PathVariable Long id,
            @PathVariable Long imageId
    ) {
        return ApiResponse.ok("Cập nhật ảnh chính thành công", carService.setPrimaryCarImage(id, imageId));
    }

    // Thêm giấy tờ xe (cà vẹt, đăng kiểm, bảo hiểm)
    @PreAuthorize("hasRole('OWNER')")
    @PostMapping("/{id}/documents")
    public ApiResponse<CarDocumentResponse> addCarDocument(
            @PathVariable Long id,
            @Valid @RequestBody CarDocumentRequest request
    ) {
        return ApiResponse.ok("Gửi giấy tờ xe thành công, chờ admin duyệt", carService.addCarDocument(id, request));
    }

    // Xem danh sách giấy tờ của xe
    @PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
    @GetMapping("/{id}/documents")
    public ApiResponse<List<CarDocumentResponse>> getCarDocuments(
            @PathVariable Long id
    ) {
        return ApiResponse.ok(carService.getCarDocuments(id));
    }
}
