package com.carrental.service.impl;

import com.carrental.dto.request.CarCreateRequest;
import com.carrental.dto.request.CarDocumentVerifyRequest;
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
import com.carrental.enums.CarDocumentType;
import com.carrental.enums.CarStatus;
import com.carrental.enums.CarType;
import com.carrental.enums.ListingStatus;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.service.CarService;
import com.carrental.service.CurrentUserService;
import com.carrental.service.PublicImageStorageService;
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
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.BiFunction;
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
    private final PublicImageStorageService publicImageStorageService;

    @Override
    @Transactional
    public CarResponse createCar(CarCreateRequest request) {
        log.info("Create car licensePlate={}", request.getLicensePlate());
        try {
            Customer owner = currentUserService.getCurrentUser();
            CurrentUserService.requireVerifiedOwner(owner);

            Car car = request.toEntity();
            if (carRepository.existsByLicensePlateIgnoreCase(car.getLicensePlate())
                    || carRepository.existsByNormalizedLicensePlate(normalizePlate(car.getLicensePlate()))) {
                throw new AppException(HttpStatus.CONFLICT, "Biển số xe đã tồn tại trên hệ thống: " + car.getLicensePlate());
            }

            car.setOwner(owner);

            // Tự động điền thông tin liên hệ từ chủ xe nếu không nhập
            if (car.getContactName() == null || car.getContactName().isBlank()) {
                car.setContactName(owner.getFullName());
            }
            if (car.getContactPhone() == null || car.getContactPhone().isBlank()) {
                car.setContactPhone(owner.getPhone());
            }
            if (car.getContactZalo() == null || car.getContactZalo().isBlank()) {
                car.setContactZalo(owner.getPhone());
            }

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
            String oldIdentity = identityOf(car);
            java.math.BigDecimal oldPrice = car.getRentalPricePerDay();
            request.applyTo(car);

            boolean approved = car.getStatus() == CarStatus.ACTIVE || car.getStatus() == CarStatus.INACTIVE;
            if (approved && (!oldIdentity.equals(identityOf(car)) || priceChangedSharply(oldPrice, car.getRentalPricePerDay()))) {
                // Đổi thông tin nhận dạng xe hoặc giá thay đổi mạnh: ẩn tin và chờ admin duyệt lại.
                car.setStatus(CarStatus.PENDING_APPROVAL);
                car.setListingStatus(com.carrental.enums.ListingStatus.UNLISTED);
                log.info("Car id={} đổi thông tin quan trọng -> PENDING_APPROVAL, ẩn tin chờ duyệt lại", carId);
            } else if (car.getStatus() == CarStatus.REJECTED) {
                car.getStatus().validateTransitionTo(CarStatus.PENDING_APPROVAL);
                car.setStatus(CarStatus.PENDING_APPROVAL);
                car.setRejectReason(null);
                log.info("Car id={} được gửi duyệt lại (REJECTED -> PENDING_APPROVAL)", carId);
            }

            return toResponse(carRepository.saveAndFlush(car));
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

    @org.springframework.beans.factory.annotation.Autowired(required = false)
    private com.carrental.repository.CarSubscriptionRepository carSubscriptionRepository;

    /**
     * Tạm dừng xe thì dừng đếm thời gian slot đang chạy; hoạt động lại thì cộng bù
     * khoảng thời gian đã dừng vào slot hiện tại và ngày kết thúc gói.
     */
    private void pauseOrResumeSubscription(Car car, CarStatus newStatus) {
        if (carSubscriptionRepository == null || car.getCurrentSubscriptionId() == null) {
            return;
        }
        carSubscriptionRepository.findById(car.getCurrentSubscriptionId()).ifPresent(sub -> {
            if (sub.getStatus() != com.carrental.enums.SubscriptionStatus.ACTIVE) {
                return;
            }
            java.time.LocalDateTime now = com.carrental.util.TimeUtil.nowVn();
            if (newStatus == CarStatus.INACTIVE && sub.getPausedAt() == null
                    && sub.getCurrentSlotEndDate() != null && sub.getCurrentSlotEndDate().isAfter(now)) {
                sub.setPausedAt(now);
                car.setListingStatus(ListingStatus.UNLISTED);
            } else if (newStatus == CarStatus.ACTIVE && sub.getPausedAt() != null) {
                java.time.Duration paused = java.time.Duration.between(sub.getPausedAt(), now);
                sub.setCurrentSlotEndDate(sub.getCurrentSlotEndDate().plus(paused));
                if (sub.getEndDate() != null) {
                    sub.setEndDate(sub.getEndDate().plus(paused));
                }
                sub.setPausedAt(null);
                car.setListingStatus(ListingStatus.LISTED);
            }
            carSubscriptionRepository.save(sub);
        });
    }

    private static String identityOf(Car car) {
        return String.join("|", String.valueOf(car.getBrand()), String.valueOf(car.getModel()),
                String.valueOf(car.getManufactureYear()), String.valueOf(car.getLicensePlate())).toLowerCase();
    }

    /** Giá thuê/ngày thay đổi quá 50% so với giá đã được duyệt. */
    private static boolean priceChangedSharply(java.math.BigDecimal before, java.math.BigDecimal after) {
        if (before == null || after == null || before.signum() <= 0) {
            return false;
        }
        java.math.BigDecimal ratio = after.subtract(before).abs().divide(before, 4, java.math.RoundingMode.HALF_UP);
        return ratio.compareTo(new java.math.BigDecimal("0.5")) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public CarResponse getCarById(Long carId) {
        log.info("Get car by id carId={}", carId);
        try {
            Car car = carRepository.findWithOwnerById(carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));

            boolean canViewFull = currentUserService.optionalCurrentUser()
                    .map(u -> currentUserService.isOwner(car, u) || currentUserService.isAdmin(u))
                    .orElse(false);

            if (!canViewFull && (car.getStatus() != CarStatus.ACTIVE
                    || car.getOwner() == null || car.getOwner().getStatus() != com.carrental.enums.CustomerStatus.ACTIVE)) {
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
        return getMyCars(status, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> getMyCars(CarStatus status, ListingStatus listingStatus, Pageable pageable) {
        log.info("Get my cars status={}, listingStatus={}", status, listingStatus);
        try {
            Customer owner = currentUserService.getCurrentUser();
            CurrentUserService.requireVerifiedOwner(owner);
            Specification<Car> spec = (root, query, cb) -> {
                List<Predicate> ps = new ArrayList<>();
                ps.add(cb.equal(root.get("owner").get("id"), owner.getId()));
                if (status != null) {
                    ps.add(cb.equal(root.get("status"), status));
                }
                if (listingStatus != null) {
                    ps.add(cb.equal(root.get("listingStatus"), listingStatus));
                }
                return cb.and(ps.toArray(new Predicate[0]));
            };

            Page<Car> carPage = carRepository.findAll(spec, pageable);
            return toPageSummaryBatch(carPage, CarSummaryResponse::from);
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
            Page<Car> carPage = status != null
                    ? carRepository.findAllByStatus(status, pageable)
                    : carRepository.findAll(pageable);

            return toPageSummaryBatch(carPage, CarSummaryResponse::from);
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

            // Chủ xe chỉ được bật/tắt xe ĐÃ được admin duyệt. Xe đang chờ duyệt hoặc bị từ chối
            // phải đi qua luồng duyệt của admin, không được tự chuyển sang ACTIVE.
            if (car.getStatus() != CarStatus.ACTIVE && car.getStatus() != CarStatus.INACTIVE) {
                throw new AppException(HttpStatus.CONFLICT, "Xe chưa được quản trị viên duyệt nên chưa thể tự đổi trạng thái");
            }

            car.getStatus().validateTransitionTo(newStatus);
            car.setStatus(newStatus);
            pauseOrResumeSubscription(car, newStatus);
            return toResponse(carRepository.saveAndFlush(car));
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
        return searchCars(city, carType, brand, seats, null, null, null, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> searchCars(
            String city,
            CarType carType,
            String brand,
            Integer seats,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            ListingStatus listingStatus,
            Pageable pageable
    ) {
        return searchCars(city, carType, brand, seats, minPrice, maxPrice, listingStatus, null, null, java.util.Set.of(), pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSummaryResponse> searchCars(
            String city, CarType carType, String brand, Integer seats, BigDecimal minPrice, BigDecimal maxPrice,
            ListingStatus listingStatus, com.carrental.enums.Transmission transmission,
            com.carrental.enums.FuelType fuelType, java.util.Set<Long> excludedCarIds, Pageable pageable
    ) {
        log.info("Search cars city={}, carType={}, brand={}, seats={}, minPrice={}, maxPrice={}, listingStatus={}",
                city, carType, brand, seats, minPrice, maxPrice, listingStatus);
        try {
            Specification<Car> spec = (root, query, cb) -> {
                List<Predicate> ps = new ArrayList<>();
                ps.add(cb.equal(root.get("status"), CarStatus.ACTIVE));
                // Chủ xe bị khoá: ẩn toàn bộ tin đăng khỏi trang công khai.
                ps.add(cb.equal(root.get("owner").get("status"), com.carrental.enums.CustomerStatus.ACTIVE));

                if (listingStatus != null) {
                    ps.add(cb.equal(root.get("listingStatus"), listingStatus));
                } else {
                    // Mặc định hiển thị xe đang LISTED hoặc tương thích xe ACTIVE
                    ps.add(cb.or(
                            cb.equal(root.get("listingStatus"), ListingStatus.LISTED),
                            cb.isNull(root.get("listingStatus"))
                    ));
                }

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
                if (minPrice != null) {
                    ps.add(cb.greaterThanOrEqualTo(root.get("rentalPricePerDay"), minPrice));
                }
                if (maxPrice != null) {
                    ps.add(cb.lessThanOrEqualTo(root.get("rentalPricePerDay"), maxPrice));
                }
                if (transmission != null) {
                    ps.add(cb.equal(root.get("transmission"), transmission));
                }
                if (fuelType != null) {
                    ps.add(cb.equal(root.get("fuelType"), fuelType));
                }
                if (excludedCarIds != null && !excludedCarIds.isEmpty()) {
                    ps.add(cb.not(root.get("id").in(excludedCarIds)));
                }
                return cb.and(ps.toArray(new Predicate[0]));
            };

            Page<Car> carPage = carRepository.findAll(spec, pageable);
            return toPageSummaryBatch(carPage, CarSummaryResponse::publicFrom);
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
            Car car = findCarOrThrow(carId);
            car.getStatus().validateTransitionTo(CarStatus.ACTIVE);

            // Chỉ duyệt xe khi giấy đăng ký xe (cà vẹt) đã được xác minh
            boolean registrationVerified = carDocumentRepository
                    .findByCarIdAndDocType(carId, com.carrental.enums.CarDocumentType.REGISTRATION)
                    .map(doc -> doc.getVerifyStatus() == VerificationStatus.APPROVED)
                    .orElse(false);
            if (!registrationVerified) {
                throw new AppException(HttpStatus.CONFLICT,
                        "Xe chưa có giấy đăng ký xe được xác minh nên chưa thể duyệt. Hãy xác minh giấy tờ xe trước");
            }

            car.setRejectReason(null);
            car.setStatus(CarStatus.ACTIVE);
            return toResponse(carRepository.saveAndFlush(car));
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
            Car car = findCarOrThrow(carId);
            car.getStatus().validateTransitionTo(CarStatus.REJECTED);
            car.setStatus(CarStatus.REJECTED);
            car.setRejectReason(reason);
            return toResponse(carRepository.saveAndFlush(car));
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
    public List<CarImageResponse> addCarImages(Long carId, List<MultipartFile> files, Integer primaryIndex) {
        log.info("Upload multipart car images carId={}, count={}", carId, files != null ? files.size() : 0);
        List<String> storedUrls = List.of();
        try {
            Car car = loadOwnedCar(carId);
            if (files == null || files.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Danh sách ảnh không được để trống");
            }
            long currentCount = carImageRepository.countByCarId(carId);
            if (currentCount + files.size() > MAX_CAR_IMAGES) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Mỗi xe chỉ được có tối đa " + MAX_CAR_IMAGES + " hình ảnh");
            }
            if (primaryIndex != null && (primaryIndex < 0 || primaryIndex >= files.size())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vị trí ảnh đại diện không hợp lệ");
            }

            storedUrls = publicImageStorageService.storeImages(files);

            if (primaryIndex != null) {
                clearPrimary(carId);
            }
            boolean isFirstImageEver = (currentCount == 0);
            List<CarImage> entities = new ArrayList<>(storedUrls.size());
            for (int i = 0; i < storedUrls.size(); i++) {
                boolean isPrimary = (primaryIndex != null && i == primaryIndex)
                        || (primaryIndex == null && isFirstImageEver && i == 0);
                entities.add(CarImage.builder()
                        .car(car)
                        .imageUrl(storedUrls.get(i))
                        .isPrimary(isPrimary)
                        .sortOrder((int) currentCount + i)
                        .build());
            }
            return carImageRepository.saveAllAndFlush(entities).stream()
                    .map(CarImageResponse::from)
                    .toList();
        } catch (AppException e) {
            publicImageStorageService.deleteQuietly(storedUrls);
            log.warn("Upload ảnh xe thất bại carId={}: {}", carId, e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            publicImageStorageService.deleteQuietly(storedUrls);
            log.warn("Lỗi dữ liệu khi upload ảnh xe carId={}: {}", carId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể lưu hình ảnh xe");
        } catch (Exception e) {
            publicImageStorageService.deleteQuietly(storedUrls);
            log.error("Lỗi không mong muốn khi upload ảnh xe carId={}", carId, e);
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
    public CarDocumentResponse addCarDocument(Long carId, CarDocumentType docType, LocalDate expiresAt, MultipartFile file) {
        log.info("Add car document carId={}, docType={}", carId, docType);
        try {
            Car car = loadOwnedCar(carId);

            if (expiresAt != null && expiresAt.isBefore(TimeUtil.nowVn().toLocalDate())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Giấy tờ xe đã hết hạn sử dụng");
            }

            if (file == null || file.isEmpty()) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Tệp giấy tờ xe không được để trống");
            }

            String storedFileUrl = publicImageStorageService.storeImage(file);

            CarDocument doc = carDocumentRepository.findByCarIdAndDocType(carId, docType)
                    .orElse(CarDocument.builder().car(car).docType(docType).build());

            if (doc.getId() != null && doc.getVerifyStatus() != null) {
                doc.getVerifyStatus().validateTransitionTo(VerificationStatus.PENDING);
            }

            doc.setFileUrl(storedFileUrl);
            doc.setExpiresAt(expiresAt);
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
            Customer requester = currentUserService.getCurrentUser();
            Car car = findCarOrThrow(carId);
            if (!currentUserService.isAdmin(requester)) {
                CurrentUserService.requireVerifiedOwner(requester);
                if (!currentUserService.isOwner(car, requester)) {
                    throw new AppException(HttpStatus.FORBIDDEN, "Bạn không có quyền xem giấy tờ của xe này");
                }
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
            Customer admin = currentUserService.getCurrentUser();

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

    /** Bỏ gạch nối, dấu chấm, khoảng trắng và viết hoa để so trùng biển số. */
    static String normalizePlate(String plate) {
        return plate == null ? "" : plate.replaceAll("[-.\\s]", "").toUpperCase(java.util.Locale.ROOT);
    }

    private Car findCarOrThrow(Long carId) {
        return carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
    }

    private Car loadOwnedCar(Long carId) {
        Customer owner = currentUserService.getCurrentUser();
        CurrentUserService.requireVerifiedOwner(owner);
        Car car = findCarOrThrow(carId);
        if (!currentUserService.isOwner(car, owner)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không phải chủ của xe này");
        }
        return car;
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

    private PageResponse<CarSummaryResponse> toPageSummaryBatch(
            Page<Car> carPage,
            BiFunction<Car, String, CarSummaryResponse> mapper
    ) {
        List<Long> carIds = carPage.getContent().stream().map(Car::getId).toList();
        Map<Long, String> primaryImages = carImageRepository.findAllByCarIdInAndIsPrimaryTrue(carIds).stream()
                .collect(Collectors.toMap(img -> img.getCar().getId(), CarImage::getImageUrl, (a, b) -> a));

        return PageResponse.from(carPage.map(c -> mapper.apply(c, primaryImages.get(c.getId()))));
    }
}
