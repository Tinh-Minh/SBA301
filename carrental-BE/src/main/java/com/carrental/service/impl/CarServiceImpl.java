package com.carrental.service.impl;

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
import com.carrental.entity.Car;
import com.carrental.entity.CarDocument;
import com.carrental.entity.CarImage;
import com.carrental.entity.Customer;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.CustomerStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.exception.ForbiddenException;
import com.carrental.exception.UnauthorizedException;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.service.CarService;
import com.carrental.service.CurrentUserService;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private static final int MAX_CAR_IMAGES = 10;

    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final CarDocumentRepository carDocumentRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public CarResponse createCar(CarCreateRequest request) {
        log.info("Create car licensePlate={}", request.getLicensePlate());
        try {
            Customer owner = requireActiveUser();

            Car car = request.toEntity();
            if (carRepository.existsByLicensePlateIgnoreCase(car.getLicensePlate())) {
                throw new AppException(HttpStatus.CONFLICT, "Biển số xe đã tồn tại trên hệ thống: " + car.getLicensePlate());
            }

            car.setOwner(owner);
            Car savedCar = carRepository.saveAndFlush(car);
            return CarResponse.from(savedCar, List.of(), List.of());
        } catch (AppException e) {
            log.warn("Tạo xe thất bại: {}", e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi tạo xe: {}", e.getMessage());
            throw DbErrors.toAppException(e, "Không thể đăng ký xe");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo xe", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đăng ký xe mới");
        }
    }

    @Override
    @Transactional
    public CarResponse updateCar(Long carId, CarUpdateRequest request) {
        log.info("Update car id={}", carId);
        try {
            Car car = loadOwnedCar(carId);

            request.applyTo(car);

            // Xe đang REJECTED mà chủ xe sửa xong: tự chuyển về PENDING_APPROVAL
            if (car.getStatus() == CarStatus.REJECTED) {
                car.getStatus().validateTransitionTo(CarStatus.PENDING_APPROVAL);
                car.setStatus(CarStatus.PENDING_APPROVAL);
                log.info("Car id={} được gửi duyệt lại (REJECTED -> PENDING_APPROVAL)", carId);
            }

            Car updatedCar = carRepository.saveAndFlush(car);
            return toResponse(updatedCar);
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
    public CarResponse getCarById(Long carId) {
        log.info("Get car by id carId={}", carId);
        try {
            Car car = carRepository.findWithOwnerById(carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));

            Optional<Customer> requester = optionalActiveUser();
            boolean canViewFull = requester
                    .map(u -> isOwner(car, u.getId()) || currentUserService.isAdmin(u))
                    .orElse(false);

            if (!canViewFull && car.getStatus() != CarStatus.ACTIVE) {
                throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId);
            }

            if (canViewFull) {
                return toResponse(car);
            }
            List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(carId);
            return CarResponse.publicView(car, images);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải thông tin xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> getMyCars(CarStatus status, Pageable pageable) {
        log.info("Get my cars status={}", status);
        try {
            Customer owner = requireActiveUser();
            Page<Car> carPage = status != null
                    ? carRepository.findAllByOwnerIdAndStatus(owner.getId(), status, pageable)
                    : carRepository.findAllByOwnerId(owner.getId(), pageable);

            return toPageSummaryBatch(carPage, false);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách xe của chủ xe", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách xe");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> getCarsByStatus(CarStatus status, Pageable pageable) {
        log.info("Admin get cars by status status={}", status);
        try {
            requireAdmin();
            Page<Car> carPage = status != null
                    ? carRepository.findAllByStatus(status, pageable)
                    : carRepository.findAll(pageable);

            return toPageSummaryBatch(carPage, false);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi admin lấy danh sách xe", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải danh sách xe");
        }
    }

    @Override
    @Transactional
    public CarResponse updateCarStatusByOwner(Long carId, CarStatus newStatus) {
        log.info("Owner update car status carId={}, newStatus={}", carId, newStatus);
        try {
            Car car = loadOwnedCar(carId);

            if (newStatus != CarStatus.ACTIVE && newStatus != CarStatus.INACTIVE) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chủ xe chỉ có thể tạm dừng (INACTIVE) hoặc kích hoạt lại (ACTIVE) xe");
            }

            car.getStatus().validateTransitionTo(newStatus);
            car.setStatus(newStatus);
            Car savedCar = carRepository.saveAndFlush(car);
            return toResponse(savedCar);
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
            return toPageSummaryBatch(carPage, true);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm xe", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tìm kiếm xe");
        }
    }

    @Override
    @Transactional
    public CarResponse approveCar(Long carId) {
        log.info("Admin approve car carId={}", carId);
        try {
            requireAdmin();
            Car car = findCarOrThrow(carId);

            car.getStatus().validateTransitionTo(CarStatus.ACTIVE);
            car.setStatus(CarStatus.ACTIVE);
            Car savedCar = carRepository.saveAndFlush(car);
            return toResponse(savedCar);
        } catch (AppException e) {
            log.warn("Duyệt xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi duyệt xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể duyệt xe");
        } catch (Exception e) {
            log.error("Lỗi khi duyệt xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể duyệt xe");
        }
    }

    @Override
    @Transactional
    public CarResponse rejectCar(Long carId, String reason) {
        log.info("Admin reject car carId={}, reason={}", carId, reason);
        try {
            requireAdmin();
            Car car = findCarOrThrow(carId);

            if (reason == null || reason.isBlank()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Lý do từ chối không được để trống");
            }

            car.getStatus().validateTransitionTo(CarStatus.REJECTED);
            car.setStatus(CarStatus.REJECTED);
            Car savedCar = carRepository.saveAndFlush(car);
            return toResponse(savedCar);
        } catch (AppException e) {
            log.warn("Từ chối xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi từ chối xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể từ chối duyệt xe");
        } catch (Exception e) {
            log.error("Lỗi khi từ chối xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể từ chối duyệt xe");
        }
    }

    @Override
    @Transactional
    public List<CarImageResponse> addCarImages(Long carId, List<CarImageRequest> requests) {
        log.info("Add car images carId={}, count={}", carId, requests != null ? requests.size() : 0);
        try {
            Car car = loadOwnedCar(carId);

            if (requests == null || requests.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Danh sách ảnh không được để trống");
            }

            long currentCount = carImageRepository.countByCarId(carId);
            if (currentCount + requests.size() > MAX_CAR_IMAGES) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Mỗi xe chỉ được có tối đa " + MAX_CAR_IMAGES + " hình ảnh");
            }

            long primaryRequestsCount = requests.stream().filter(r -> Boolean.TRUE.equals(r.getIsPrimary())).count();
            if (primaryRequestsCount > 1) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Chỉ được chỉ định tối đa 1 ảnh đại diện trong một lần tải lên");
            }

            if (primaryRequestsCount == 1) {
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
    public void deleteCarImage(Long carId, Long imageId) {
        log.info("Delete car image carId={}, imageId={}", carId, imageId);
        try {
            loadOwnedCar(carId);

            CarImage img = carImageRepository.findByIdAndCarId(imageId, carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh id=" + imageId + " của xe id=" + carId));

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
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi xoá ảnh imageId={}: {}", imageId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể xoá hình ảnh");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi xoá ảnh imageId={}", imageId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể xoá hình ảnh");
        }
    }

    @Override
    @Transactional
    public CarImageResponse setPrimaryCarImage(Long carId, Long imageId) {
        log.info("Set primary car image carId={}, imageId={}", carId, imageId);
        try {
            loadOwnedCar(carId);

            CarImage targetImg = carImageRepository.findByIdAndCarId(imageId, carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy ảnh id=" + imageId + " của xe id=" + carId));

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
    public CarDocumentResponse addCarDocument(Long carId, CarDocumentRequest request) {
        log.info("Add car document carId={}, docType={}", carId, request.getDocType());
        try {
            Car car = loadOwnedCar(carId);

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
    public List<CarDocumentResponse> getCarDocuments(Long carId) {
        log.info("Get car documents carId={}", carId);
        try {
            Customer requester = requireActiveUser();
            Car car = findCarOrThrow(carId);
            if (!isOwner(car, requester.getId()) && !currentUserService.isAdmin(requester)) {
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
    public CarDocumentResponse verifyCarDocumentByAdmin(Long carId, Long documentId, CarDocumentVerifyRequest request) {
        log.info("Admin verify car document docId={}, status={}", documentId, request.getVerifyStatus());
        try {
            Customer admin = requireAdmin();

            CarDocument doc = carDocumentRepository.findByIdAndCarId(documentId, carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giấy tờ xe id=" + documentId + " của xe id=" + carId));

            if (request.getVerifyStatus() == VerificationStatus.PENDING) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Trạng thái xác minh chỉ có thể là APPROVED hoặc REJECTED");
            }

            if (request.getVerifyStatus() == VerificationStatus.REJECTED &&
                    (request.getRejectReason() == null || request.getRejectReason().isBlank())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do từ chối giấy tờ");
            }

            doc.getVerifyStatus().validateTransitionTo(request.getVerifyStatus());
            doc.setVerifyStatus(request.getVerifyStatus());
            doc.setRejectReason(request.getVerifyStatus() == VerificationStatus.REJECTED ? request.getRejectReason() : null);
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

    private Car findCarOrThrow(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
    }

    private Car loadOwnedCar(Long carId) {
        Customer owner = requireActiveUser();
        Car car = findCarOrThrow(carId);
        if (!isOwner(car, owner.getId())) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không phải chủ của xe này");
        }
        return car;
    }

    private boolean isOwner(Car car, Long customerId) {
        return customerId != null && car.getOwner() != null && car.getOwner().getId().equals(customerId);
    }

    private Customer requireActiveUser() {
        try {
            Customer user = currentUserService.getCurrentUser();
            if (user.getStatus() != CustomerStatus.ACTIVE) {
                throw new AppException(HttpStatus.FORBIDDEN, "Tài khoản đang bị khoá");
            }
            return user;
        } catch (UnauthorizedException e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (ForbiddenException e) {
            throw new AppException(HttpStatus.FORBIDDEN, e.getMessage());
        }
    }

    private Optional<Customer> optionalActiveUser() {
        try {
            return currentUserService.optionalCurrentUser();
        } catch (UnauthorizedException e) {
            throw new AppException(HttpStatus.UNAUTHORIZED, e.getMessage());
        } catch (ForbiddenException e) {
            throw new AppException(HttpStatus.FORBIDDEN, e.getMessage());
        }
    }

    private Customer requireAdmin() {
        Customer user = requireActiveUser();
        if (!currentUserService.isAdmin(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được thực hiện thao tác này");
        }
        return user;
    }

    private CarResponse toResponse(Car car) {
        List<CarImage> images = carImageRepository.findAllByCarIdOrderBySortOrderAsc(car.getId());
        List<CarDocument> documents = carDocumentRepository.findAllByCarId(car.getId());
        return CarResponse.from(car, images, documents);
    }

    private void clearPrimary(Long carId) {
        carImageRepository.findByCarIdAndIsPrimaryTrue(carId).ifPresent(old -> {
            old.setIsPrimary(false);
            carImageRepository.saveAndFlush(old);
        });
    }

    private PageResponse<CarSummaryResponse> toPageSummaryBatch(Page<Car> carPage, boolean publicView) {
        List<Long> carIds = carPage.getContent().stream().map(Car::getId).toList();
        Map<Long, String> primaryImages = carImageRepository.findAllByCarIdInAndIsPrimaryTrue(carIds).stream()
                .collect(Collectors.toMap(img -> img.getCar().getId(), CarImage::getImageUrl, (a, b) -> a));

        return PageResponse.from(carPage.map(c -> publicView
                ? CarSummaryResponse.publicFrom(c, primaryImages.get(c.getId()))
                : CarSummaryResponse.from(c, primaryImages.get(c.getId()))));
    }
}
