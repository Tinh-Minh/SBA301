package com.carrental.service.impl;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;
import com.carrental.entity.Car;
import com.carrental.entity.CarDocument;
import com.carrental.entity.CarImage;
import com.carrental.entity.Customer;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.service.AccessGuard;
import com.carrental.service.CarService;
import com.carrental.util.DbErrors;
import com.carrental.util.TimeUtil;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final CarDocumentRepository carDocumentRepository;
    private final AccessGuard accessGuard;

    @Override
    @Transactional
    public CarResponse createCar(Long ownerId, CarCreateRequest request) {
        log.info("Create car ownerId={}, licensePlate={}", ownerId, request.getLicensePlate());
        try {
            Customer owner = accessGuard.requireActiveUser(ownerId);

            String plate = request.getLicensePlate().trim().toUpperCase(Locale.ROOT);
            if (carRepository.existsByLicensePlateIgnoreCase(plate)) {
                throw new AppException(HttpStatus.CONFLICT, "Biển số xe đã tồn tại trên hệ thống: " + plate);
            }

            Car car = request.toEntity();
            car.setLicensePlate(plate);
            car.setOwner(owner);

            Car savedCar = carRepository.saveAndFlush(car);
            return CarResponse.from(savedCar, List.of(), List.of());
        } catch (AppException e) {
            log.warn("Tạo xe thất bại ownerId={}: {}", ownerId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi tạo xe ownerId={}: {}", ownerId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể đăng ký xe");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo xe ownerId={}", ownerId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đăng ký xe mới");
        }
    }

    @Override
    @Transactional
    public CarResponse updateCar(Long ownerId, Long carId, CarUpdateRequest request) {
        log.info("Update car id={}, ownerId={}", carId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = findCarOrThrow(carId);
            accessGuard.requireOwner(car, ownerId);

            request.applyTo(car);

            // Xe đang REJECTED mà chủ xe sửa xong: tự chuyển về PENDING_APPROVAL
            if (car.getStatus() == CarStatus.REJECTED) {
                car.getStatus().validateTransitionTo(CarStatus.PENDING_APPROVAL);
                car.setStatus(CarStatus.PENDING_APPROVAL);
                log.info("Car id={} được gửi duyệt lại (REJECTED -> PENDING_APPROVAL)", carId);
            }

            Car updatedCar = carRepository.saveAndFlush(car);

            List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(carId);
            List<CarDocument> documents = carDocumentRepository.findAllByCarId(carId);
            return CarResponse.from(updatedCar, images, documents);
        } catch (AppException e) {
            log.warn("Cập nhật xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi cập nhật xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể cập nhật thông tin xe");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi cập nhật xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể cập nhật thông tin xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CarResponse getCarById(Long carId, Long requesterId) {
        log.info("Get car by id carId={}, requesterId={}", carId, requesterId);
        try {
            Car car = carRepository.findWithOwnerById(carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));

            boolean canViewFull = accessGuard.isOwner(car, requesterId) || accessGuard.isAdmin(requesterId);

            if (!canViewFull && car.getStatus() != CarStatus.ACTIVE) {
                throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId);
            }

            List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(carId);

            if (canViewFull) {
                List<CarDocument> documents = carDocumentRepository.findAllByCarId(carId);
                return CarResponse.from(car, images, documents);
            } else {
                return CarResponse.publicView(car, images);
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải thông tin xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> getMyCars(Long ownerId, CarStatus status, Pageable pageable) {
        log.info("Get my cars ownerId={}, status={}", ownerId, status);
        try {
            accessGuard.requireActiveUser(ownerId);
            Page<Car> carPage = status != null
                    ? carRepository.findAllByOwnerIdAndStatus(ownerId, status, pageable)
                    : carRepository.findAllByOwnerId(ownerId, pageable);

            return toPageSummaryBatch(carPage);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách xe của chủ xe ownerId={}", ownerId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> getCarsByStatus(Long adminId, CarStatus status, Pageable pageable) {
        log.info("Admin get cars by status adminId={}, status={}", adminId, status);
        try {
            accessGuard.requireAdmin(adminId);
            Page<Car> carPage = status != null
                    ? carRepository.findAllByStatus(status, pageable)
                    : carRepository.findAll(pageable);

            return toPageSummaryBatch(carPage);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi admin lấy danh sách xe", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải danh sách xe");
        }
    }

    @Override
    @Transactional
    public CarResponse updateCarStatusByOwner(Long ownerId, Long carId, CarStatus newStatus) {
        log.info("Owner update car status ownerId={}, carId={}, newStatus={}", ownerId, carId, newStatus);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = findCarOrThrow(carId);
            accessGuard.requireOwner(car, ownerId);

            if (newStatus != CarStatus.ACTIVE && newStatus != CarStatus.INACTIVE) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chủ xe chỉ có thể tạm dừng (INACTIVE) hoặc kích hoạt lại (ACTIVE) xe");
            }

            car.getStatus().validateTransitionTo(newStatus);
            car.setStatus(newStatus);
            Car savedCar = carRepository.saveAndFlush(car);

            List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(carId);
            List<CarDocument> documents = carDocumentRepository.findAllByCarId(carId);
            return CarResponse.from(savedCar, images, documents);
        } catch (AppException e) {
            log.warn("Chủ xe đổi trạng thái thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi đổi trạng thái xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể cập nhật trạng thái xe");
        } catch (Exception e) {
            log.error("Lỗi khi chủ xe cập nhật trạng thái carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể cập nhật trạng thái xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> searchCars(
            String city,
            CarType carType,
            String brand,
            Integer seats,
            Pageable pageable
    ) {
        log.info("Search cars city={}, carType={}, brand={}, seats={}", city, carType, brand, seats);
        try {
            Specification<Car> spec = (root, query, cb) -> {
                List<Predicate> ps = new ArrayList<>();
                ps.add(cb.equal(root.get("status"), CarStatus.ACTIVE));

                if (city != null && !city.isBlank()) {
                    ps.add(cb.like(cb.lower(root.get("city")), "%" + city.trim().toLowerCase() + "%"));
                }
                if (carType != null) {
                    ps.add(cb.equal(root.get("carType"), carType));
                }
                if (brand != null && !brand.isBlank()) {
                    ps.add(cb.like(cb.lower(root.get("brand")), "%" + brand.trim().toLowerCase() + "%"));
                }
                if (seats != null) {
                    ps.add(cb.greaterThanOrEqualTo(root.get("seats"), seats));
                }
                return cb.and(ps.toArray(new Predicate[0]));
            };

            Page<Car> carPage = carRepository.findAll(spec, pageable);
            return toPageSummaryBatch(carPage);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm xe", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tìm kiếm xe");
        }
    }

    @Override
    @Transactional
    public CarResponse approveCar(Long adminId, Long carId) {
        log.info("Admin approve car adminId={}, carId={}", adminId, carId);
        try {
            accessGuard.requireAdmin(adminId);
            Car car = findCarOrThrow(carId);

            if (car.getStatus() != CarStatus.PENDING_APPROVAL) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ xe đang chờ duyệt (PENDING_APPROVAL) mới được duyệt");
            }

            car.getStatus().validateTransitionTo(CarStatus.ACTIVE);
            car.setStatus(CarStatus.ACTIVE);
            Car savedCar = carRepository.saveAndFlush(car);

            List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(carId);
            List<CarDocument> documents = carDocumentRepository.findAllByCarId(carId);
            return CarResponse.from(savedCar, images, documents);
        } catch (AppException e) {
            log.warn("Duyệt xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi duyệt xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể duyệt xe");
        }
    }

    @Override
    @Transactional
    public CarResponse rejectCar(Long adminId, Long carId, String reason) {
        log.info("Admin reject car adminId={}, carId={}, reason={}", adminId, carId, reason);
        try {
            accessGuard.requireAdmin(adminId);
            Car car = findCarOrThrow(carId);

            if (car.getStatus() != CarStatus.PENDING_APPROVAL) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ xe đang chờ duyệt (PENDING_APPROVAL) mới có thể từ chối");
            }

            if (reason == null || reason.isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Lý do từ chối không được để trống");
            }

            car.getStatus().validateTransitionTo(CarStatus.REJECTED);
            car.setStatus(CarStatus.REJECTED);
            Car savedCar = carRepository.saveAndFlush(car);

            List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(carId);
            List<CarDocument> documents = carDocumentRepository.findAllByCarId(carId);
            return CarResponse.from(savedCar, images, documents);
        } catch (AppException e) {
            log.warn("Từ chối xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi từ chối xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể từ chối duyệt xe");
        }
    }

    @Override
    @Transactional
    public List<CarImageResponse> addCarImages(Long ownerId, Long carId, List<CarImageRequest> requests) {
        log.info("Add car images carId={}, ownerId={}, count={}", carId, ownerId, requests != null ? requests.size() : 0);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = findCarOrThrow(carId);
            accessGuard.requireOwner(car, ownerId);

            if (requests == null || requests.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Danh sách ảnh không được để trống");
            }

            long currentCount = carImageRepository.countByCarId(carId);
            if (currentCount + requests.size() > 10) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Mỗi xe chỉ được có tối đa 10 hình ảnh");
            }

            long primaryRequestsCount = requests.stream().filter(r -> Boolean.TRUE.equals(r.getIsPrimary())).count();
            if (primaryRequestsCount > 1) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ được chỉ định tối đa 1 ảnh đại diện trong một lần tải lên");
            }

            boolean hasPrimaryInRequest = primaryRequestsCount == 1;
            if (hasPrimaryInRequest) {
                clearPrimary(carId);
            }

            boolean isFirstImageEver = (currentCount == 0);

            List<CarImage> entities = new ArrayList<>();
            for (int i = 0; i < requests.size(); i++) {
                CarImageRequest req = requests.get(i);
                boolean isPrimary = Boolean.TRUE.equals(req.getIsPrimary()) || (isFirstImageEver && i == 0);

                CarImage image = CarImage.builder()
                        .car(car)
                        .imageUrl(req.getImageUrl())
                        .isPrimary(isPrimary)
                        .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : 0)
                        .build();
                entities.add(image);
            }

            List<CarImage> saved = carImageRepository.saveAllAndFlush(entities);
            return saved.stream().map(CarImageResponse::from).toList();
        } catch (AppException e) {
            log.warn("Thêm ảnh xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi thêm ảnh xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể lưu hình ảnh xe");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi thêm ảnh xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu hình ảnh xe");
        }
    }

    @Override
    @Transactional
    public void deleteCarImage(Long ownerId, Long carId, Long imageId) {
        log.info("Delete car image carId={}, imageId={}, ownerId={}", carId, imageId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = findCarOrThrow(carId);
            accessGuard.requireOwner(car, ownerId);

            CarImage img = carImageRepository.findById(imageId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh id=" + imageId));

            if (!img.getCar().getId().equals(carId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Ảnh không thuộc về xe này");
            }

            boolean wasPrimary = Boolean.TRUE.equals(img.getIsPrimary());
            carImageRepository.delete(img);
            carImageRepository.flush();

            // Nếu xoá ảnh chính, tự động đặt ảnh có sortOrder nhỏ nhất còn lại làm ảnh chính
            if (wasPrimary) {
                carImageRepository.findFirstByCarIdOrderBySortOrderAsc(carId).ifPresent(nextImg -> {
                    nextImg.setIsPrimary(true);
                    carImageRepository.saveAndFlush(nextImg);
                });
            }
        } catch (AppException e) {
            log.warn("Xoá ảnh thất bại imageId={}: {}", imageId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi xoá ảnh imageId={}", imageId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xoá hình ảnh");
        }
    }

    @Override
    @Transactional
    public CarImageResponse setPrimaryCarImage(Long ownerId, Long carId, Long imageId) {
        log.info("Set primary car image carId={}, imageId={}, ownerId={}", carId, imageId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = findCarOrThrow(carId);
            accessGuard.requireOwner(car, ownerId);

            CarImage targetImg = carImageRepository.findById(imageId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh id=" + imageId));

            if (!targetImg.getCar().getId().equals(carId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Ảnh không thuộc xe này");
            }

            clearPrimary(carId);

            targetImg.setIsPrimary(true);
            return CarImageResponse.from(carImageRepository.saveAndFlush(targetImg));
        } catch (AppException e) {
            log.warn("Đặt ảnh chính thất bại imageId={}: {}", imageId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi đặt ảnh chính imageId={}: {}", imageId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể đặt ảnh chính");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi đặt ảnh đại diện imageId={}", imageId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đặt ảnh chính");
        }
    }

    @Override
    @Transactional
    public CarDocumentResponse addCarDocument(Long ownerId, Long carId, CarDocumentRequest request) {
        log.info("Add car document carId={}, docType={}, ownerId={}", carId, request.getDocType(), ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = findCarOrThrow(carId);
            accessGuard.requireOwner(car, ownerId);

            if (request.getExpiresAt() != null && request.getExpiresAt().isBefore(TimeUtil.nowVn().toLocalDate())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giấy tờ xe đã hết hạn sử dụng");
            }

            CarDocument doc = carDocumentRepository.findByCarIdAndDocType(carId, request.getDocType())
                    .orElse(CarDocument.builder().car(car).docType(request.getDocType()).build());

            if (doc.getId() != null && doc.getVerifyStatus() != null) {
                doc.getVerifyStatus().validateTransitionTo(VerificationStatus.PENDING);
            }

            doc.setFileUrl(request.getFileUrl());
            doc.setExpiresAt(request.getExpiresAt());
            doc.setVerifyStatus(VerificationStatus.PENDING);
            doc.setRejectReason(null);
            doc.setVerifiedBy(null);
            doc.setVerifiedAt(null);

            return CarDocumentResponse.from(carDocumentRepository.saveAndFlush(doc));
        } catch (AppException e) {
            log.warn("Thêm giấy tờ xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi thêm giấy tờ xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể lưu giấy tờ xe");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi thêm giấy tờ xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải lên giấy tờ xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<CarDocumentResponse> getCarDocuments(Long requesterId, Long carId) {
        log.info("Get car documents carId={}, requesterId={}", carId, requesterId);
        try {
            Car car = findCarOrThrow(carId);
            if (!accessGuard.isOwner(car, requesterId) && !accessGuard.isAdmin(requesterId)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem giấy tờ của xe này");
            }
            return carDocumentRepository.findAllByCarId(carId).stream()
                    .map(CarDocumentResponse::from)
                    .toList();
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi tải danh sách giấy tờ xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải giấy tờ xe");
        }
    }

    @Override
    @Transactional
    public CarDocumentResponse verifyCarDocumentByAdmin(Long adminId, Long carId, Long documentId, CarDocumentVerifyRequest request) {
        log.info("Admin verify car document docId={}, adminId={}, status={}", documentId, adminId, request.getVerifyStatus());
        try {
            Customer admin = accessGuard.requireAdmin(adminId);

            CarDocument doc = carDocumentRepository.findById(documentId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giấy tờ xe id=" + documentId));

            if (!doc.getCar().getId().equals(carId)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giấy tờ không thuộc xe chỉ định");
            }

            if (request.getVerifyStatus() == VerificationStatus.PENDING) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Trạng thái xác minh chỉ có thể là APPROVED hoặc REJECTED");
            }

            if (request.getVerifyStatus() == VerificationStatus.REJECTED &&
                    (request.getRejectReason() == null || request.getRejectReason().isBlank())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do từ chối giấy tờ");
            }

            doc.getVerifyStatus().validateTransitionTo(request.getVerifyStatus());
            doc.setVerifyStatus(request.getVerifyStatus());
            doc.setRejectReason(request.getRejectReason());
            doc.setVerifiedBy(admin);
            doc.setVerifiedAt(TimeUtil.nowVn());

            return CarDocumentResponse.from(carDocumentRepository.saveAndFlush(doc));
        } catch (AppException e) {
            log.warn("Duyệt giấy tờ xe thất bại docId={}: {}", documentId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi duyệt giấy tờ xe docId={}: {}", documentId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể cập nhật trạng thái giấy tờ");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi duyệt giấy tờ xe docId={}", documentId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể phê duyệt giấy tờ xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Car findCarOrThrow(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
    }

    private void clearPrimary(Long carId) {
        carImageRepository.findByCarIdAndIsPrimaryTrue(carId).ifPresent(old -> {
            old.setIsPrimary(false);
            carImageRepository.saveAndFlush(old);
        });
    }

    private PageResponse<CarSummaryResponse> toPageSummaryBatch(Page<Car> carPage) {
        List<Long> carIds = carPage.getContent().stream().map(Car::getId).toList();
        Map<Long, String> primaryImages = carImageRepository.findPrimaryImages(carIds).stream()
                .collect(Collectors.toMap(img -> img.getCar().getId(), CarImage::getImageUrl, (a, b) -> a));

        return PageResponse.from(carPage.map(c -> CarSummaryResponse.from(c, primaryImages.get(c.getId()))));
    }
}
