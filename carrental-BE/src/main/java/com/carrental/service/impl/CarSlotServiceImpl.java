package com.carrental.service.impl;

import com.carrental.dto.request.CarSlotCreateRequest;
import com.carrental.dto.request.CarSlotSearchRequest;
import com.carrental.dto.request.CarSlotUpdateRequest;
import com.carrental.dto.response.AvailableSlotResponse;
import com.carrental.dto.response.CarSlotResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Car;
import com.carrental.entity.CarImage;
import com.carrental.entity.CarSlot;
import com.carrental.enums.CarStatus;
import com.carrental.enums.RentalOption;
import com.carrental.enums.RentalType;
import com.carrental.enums.SlotStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CarImageRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSlotRepository;
import com.carrental.util.AccessGuard;
import com.carrental.service.CarSlotService;
import com.carrental.util.DbErrors;
import com.carrental.util.PageRequestFactory;
import com.carrental.util.TimeUtil;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CarSlotServiceImpl implements CarSlotService {

    private final CarSlotRepository carSlotRepository;
    private final CarRepository carRepository;
    private final CarImageRepository carImageRepository;
    private final AccessGuard accessGuard;

    @Override
    @Transactional
    public CarSlotResponse createSlot(Long ownerId, CarSlotCreateRequest request) {
        log.info("Create car slot carId={}, ownerId={}, start={}, end={}",
                request.getCarId(), ownerId, request.getStartTime(), request.getEndTime());
        try {
            accessGuard.requireActiveUser(ownerId);

            LocalDateTime now = TimeUtil.nowVn();
            if (request.getStartTime().isBefore(now)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian bắt đầu phải ở tương lai");
            }
            if (!request.getEndTime().isAfter(request.getStartTime())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải sau thời gian bắt đầu");
            }

            Car car = carRepository.findById(request.getCarId())
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + request.getCarId()));

            accessGuard.requireOwner(car, ownerId);

            if (car.getStatus() != CarStatus.ACTIVE) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Xe phải ở trạng thái ACTIVE mới được mở slot cho thuê");
            }

            long durationMinutes = Duration.between(request.getStartTime(), request.getEndTime()).toMinutes();
            int minHours = request.getMinRentalHours() != null ? request.getMinRentalHours() : 1;

            if (minHours * 60L > durationMinutes) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian thuê tối thiểu (" + minHours + " giờ) không được vượt quá độ dài khung giờ slot");
            }

            RentalOption option = request.getRentalOption() != null ? request.getRentalOption() : RentalOption.BOTH;
            if (option == RentalOption.DAILY && durationMinutes < 24 * 60) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Slot cho thuê theo ngày (DAILY) phải có độ dài tối thiểu 24 giờ");
            }

            // Kiểm tra trùng lặp lịch
            boolean isOverlapping = carSlotRepository.existsByCarIdAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    car.getId(), SlotStatus.CANCELLED, request.getEndTime(), request.getStartTime());
            if (isOverlapping) {
                throw new AppException(HttpStatus.CONFLICT, "Khung giờ này đã bị trùng với một slot khác của xe");
            }

            // Chụp giá từ Car
            CarSlot slot = request.toEntity(car);
            CarSlot saved = carSlotRepository.saveAndFlush(slot);

            return CarSlotResponse.from(saved);
        } catch (AppException e) {
            log.warn("Tạo slot thất bại carId={}: {}", request.getCarId(), e.getMessage());
            throw e;
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi tạo slot carId={}: {}", request.getCarId(), e.getMessage());
            throw DbErrors.toAppException(e, "Không thể tạo khung giờ cho thuê");
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi tạo slot carId={}", request.getCarId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tạo khung giờ cho thuê");
        }
    }

    @Override
    @Transactional
    public CarSlotResponse updateSlot(Long ownerId, Long slotId, CarSlotUpdateRequest request) {
        log.info("Update slot slotId={}, ownerId={}", slotId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            CarSlot slot = findSlotOrThrow(slotId);
            accessGuard.requireOwner(slot.getCar(), ownerId);

            if (slot.getStatus() == SlotStatus.CANCELLED) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể chỉnh sửa slot đã bị huỷ");
            }

            LocalDateTime newStart = request.getStartTime() != null ? request.getStartTime() : slot.getStartTime();
            LocalDateTime newEnd = request.getEndTime() != null ? request.getEndTime() : slot.getEndTime();

            if (request.getStartTime() != null && newStart.isBefore(TimeUtil.nowVn())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian bắt đầu mới phải ở tương lai");
            }
            if (!newEnd.isAfter(newStart)) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải sau thời gian bắt đầu");
            }

            long durationMinutes = Duration.between(newStart, newEnd).toMinutes();
            int minHours = request.getMinRentalHours() != null ? request.getMinRentalHours() : slot.getMinRentalHours();
            if (minHours * 60L > durationMinutes) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Số giờ thuê tối thiểu không được lớn hơn tổng thời gian slot");
            }

            RentalOption option = request.getRentalOption() != null ? request.getRentalOption() : slot.getRentalOption();
            if (option == RentalOption.DAILY && durationMinutes < 24 * 60) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Slot theo ngày phải dài tối thiểu 24 giờ");
            }

            // Kiểm tra trùng slot khác
            boolean isOverlapping = carSlotRepository.existsByCarIdAndIdNotAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    slot.getCar().getId(), slot.getId(), SlotStatus.CANCELLED, newEnd, newStart);
            if (isOverlapping) {
                throw new AppException(HttpStatus.CONFLICT, "Thời gian chỉnh sửa bị trùng với slot khác của xe");
            }

            slot.setStartTime(newStart);
            slot.setEndTime(newEnd);
            slot.setRentalOption(option);
            slot.setMinRentalHours(minHours);

            if (request.getPricePerHour() != null) slot.setPricePerHour(request.getPricePerHour());
            if (request.getPricePerDay() != null) slot.setPricePerDay(request.getPricePerDay());

            CarSlot updated = carSlotRepository.saveAndFlush(slot);
            return CarSlotResponse.from(updated);
        } catch (AppException e) {
            log.warn("Cập nhật slot thất bại slotId={}: {}", slotId, e.getMessage());
            throw e;
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException(HttpStatus.CONFLICT, "Dữ liệu slot vừa được thay đổi bởi thao tác khác, vui lòng tải lại");
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi sửa slot slotId={}: {}", slotId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể cập nhật khung giờ cho thuê");
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật slot slotId={}", slotId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể cập nhật khung giờ cho thuê");
        }
    }

    @Override
    @Transactional
    public CarSlotResponse closeSlot(Long ownerId, Long slotId) {
        log.info("Close slot id={}, ownerId={}", slotId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            CarSlot slot = findSlotOrThrow(slotId);
            accessGuard.requireOwner(slot.getCar(), ownerId);

            slot.getStatus().validateTransitionTo(SlotStatus.CLOSED);
            slot.setStatus(SlotStatus.CLOSED);

            return CarSlotResponse.from(carSlotRepository.saveAndFlush(slot));
        } catch (AppException e) {
            log.warn("Đóng slot thất bại slotId={}: {}", slotId, e.getMessage());
            throw e;
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException(HttpStatus.CONFLICT, "Dữ liệu slot vừa được thay đổi, vui lòng tải lại");
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi đóng slot slotId={}: {}", slotId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể đóng khung giờ cho thuê");
        } catch (Exception e) {
            log.error("Lỗi khi đóng slot slotId={}", slotId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể đóng khung giờ cho thuê");
        }
    }

    @Override
    @Transactional
    public CarSlotResponse cancelSlot(Long ownerId, Long slotId) {
        log.info("Cancel slot id={}, ownerId={}", slotId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            CarSlot slot = findSlotOrThrow(slotId);
            accessGuard.requireOwner(slot.getCar(), ownerId);

            slot.getStatus().validateTransitionTo(SlotStatus.CANCELLED);
            slot.setStatus(SlotStatus.CANCELLED);

            // DB trigger trg_slot_change sẽ chặn nếu đang có đơn thuê PENDING/CONFIRMED/ONGOING
            return CarSlotResponse.from(carSlotRepository.saveAndFlush(slot));
        } catch (AppException e) {
            log.warn("Huỷ slot thất bại slotId={}: {}", slotId, e.getMessage());
            throw e;
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException(HttpStatus.CONFLICT, "Dữ liệu slot vừa được thay đổi, vui lòng tải lại");
        } catch (DataAccessException e) {
            log.warn("Lỗi cơ sở dữ liệu khi huỷ slot slotId={}: {}", slotId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể huỷ slot");
        } catch (Exception e) {
            log.error("Lỗi khi huỷ slot slotId={}", slotId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể huỷ khung giờ cho thuê");
        }
    }

    @Override
    @Transactional
    public CarSlotResponse reopenSlot(Long ownerId, Long slotId) {
        log.info("Reopen slot id={}, ownerId={}", slotId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            CarSlot slot = findSlotOrThrow(slotId);
            accessGuard.requireOwner(slot.getCar(), ownerId);

            slot.getStatus().validateTransitionTo(SlotStatus.OPEN);

            // Kiểm tra xe còn ACTIVE và slot chưa kết thúc
            if (slot.getCar().getStatus() != CarStatus.ACTIVE) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Xe phải ở trạng thái ACTIVE mới được mở lại slot");
            }
            if (slot.getEndTime().isBefore(TimeUtil.nowVn())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Không thể mở lại slot đã qua trong quá khứ");
            }

            // Kiểm tra overlap
            boolean isOverlapping = carSlotRepository.existsByCarIdAndIdNotAndStatusNotAndStartTimeLessThanAndEndTimeGreaterThan(
                    slot.getCar().getId(), slot.getId(), SlotStatus.CANCELLED, slot.getEndTime(), slot.getStartTime());
            if (isOverlapping) {
                throw new AppException(HttpStatus.CONFLICT, "Khung giờ này đã bị trùng với một slot mở khác");
            }

            slot.setStatus(SlotStatus.OPEN);
            return CarSlotResponse.from(carSlotRepository.saveAndFlush(slot));
        } catch (AppException e) {
            log.warn("Mở lại slot thất bại slotId={}: {}", slotId, e.getMessage());
            throw e;
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new AppException(HttpStatus.CONFLICT, "Dữ liệu slot vừa được thay đổi, vui lòng tải lại");
        } catch (DataAccessException e) {
            log.warn("Lỗi dữ liệu khi mở lại slot slotId={}: {}", slotId, e.getMessage());
            throw DbErrors.toAppException(e, "Không thể mở lại khung giờ cho thuê");
        } catch (Exception e) {
            log.error("Lỗi khi mở lại slot slotId={}", slotId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể mở lại khung giờ cho thuê");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CarSlotResponse getSlotById(Long slotId, Long requesterId) {
        log.info("Get slot by id slotId={}, requesterId={}", slotId, requesterId);
        try {
            CarSlot slot = carSlotRepository.findWithCarById(slotId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy slot id=" + slotId));

            boolean canViewFull = accessGuard.isOwner(slot.getCar(), requesterId) || accessGuard.isAdmin(requesterId);

            // Công khai chỉ trả slot OPEN của xe ACTIVE
            if (!canViewFull && (slot.getStatus() != SlotStatus.OPEN || slot.getCar().getStatus() != CarStatus.ACTIVE)) {
                throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy slot id=" + slotId);
            }

            return CarSlotResponse.from(slot);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin slot slotId={}", slotId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải thông tin khung giờ");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CarSlotResponse> getSlotsByCarId(Long ownerId, Long carId, Pageable pageable) {
        log.info("Get slots by car carId={}, ownerId={}", carId, ownerId);
        try {
            accessGuard.requireActiveUser(ownerId);
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
            accessGuard.requireOwner(car, ownerId);

            Page<CarSlot> page = carSlotRepository.findAllByCarId(carId, pageable);
            return PageResponse.from(page.map(CarSlotResponse::from));
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách slot của xe carId={}", carId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tải danh sách khung giờ");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AvailableSlotResponse> searchAvailableSlots(CarSlotSearchRequest request) {
        log.info("Search available slots city={}, carType={}, rentalType={}",
                request.getCity(), request.getCarType(), request.getRentalType());
        try {
            if (request.getStartTime() != null && request.getEndTime() != null) {
                if (!request.getEndTime().isAfter(request.getStartTime())) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian trả xe phải sau thời gian nhận xe");
                }
                if (request.getStartTime().isBefore(TimeUtil.nowVn())) {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Thời gian thuê không được ở quá khứ");
                }
            } else if (request.getStartTime() != null || request.getEndTime() != null) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập cả thời gian bắt đầu và kết thúc khi tìm kiếm theo giờ");
            }

            Specification<CarSlot> spec = buildSlotSearchSpec(request);

            Pageable pageable = PageRequestFactory.of(
                    request.getPage(), request.getSize(), "startTime", "ASC",
                    Set.of("startTime", "pricePerHour", "pricePerDay"), "startTime");

            Page<CarSlot> slotPage = carSlotRepository.findAll(spec, pageable);

            List<Long> carIds = slotPage.getContent().stream().map(s -> s.getCar().getId()).toList();
            Map<Long, String> primaryImages = carImageRepository.findAllByCarIdInAndIsPrimaryTrue(carIds).stream()
                    .collect(Collectors.toMap(img -> img.getCar().getId(), CarImage::getImageUrl, (a, b) -> a));

            return PageResponse.from(slotPage.map(slot ->
                    AvailableSlotResponse.from(slot, primaryImages.get(slot.getCar().getId()))));
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            log.error("Lỗi khi tìm kiếm slot trống", e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể tìm kiếm khung giờ cho thuê");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CarSlot getOpenSlotForRental(Long slotId) {
        CarSlot slot = carSlotRepository.findWithCarById(slotId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy slot id=" + slotId));

        if (slot.getStatus() != SlotStatus.OPEN) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Slot " + slotId + " không còn ở trạng thái mở");
        }
        if (slot.getCar().getStatus() != CarStatus.ACTIVE) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Xe của slot không ở trạng thái ACTIVE");
        }
        if (slot.getEndTime().isBefore(TimeUtil.nowVn())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Slot đã kết thúc trong quá khứ");
        }
        return slot;
    }

    @Override
    @Transactional(readOnly = true)
    public CarSlot findSlotOrThrow(Long slotId) {
        return carSlotRepository.findById(slotId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy slot id=" + slotId));
    }

    private Specification<CarSlot> buildSlotSearchSpec(CarSlotSearchRequest req) {
        return (root, query, cb) -> {
            Join<CarSlot, Car> car = root.join("car");
            List<Predicate> ps = new ArrayList<>();

            ps.add(cb.equal(root.get("status"), SlotStatus.OPEN));
            ps.add(cb.equal(car.get("status"), CarStatus.ACTIVE));
            ps.add(cb.greaterThan(root.get("endTime"), TimeUtil.nowVn()));

            if (req.getCity() != null && !req.getCity().isBlank()) {
                ps.add(cb.like(cb.lower(car.get("city")), "%" + req.getCity().trim().toLowerCase() + "%"));
            }
            if (req.getCarType() != null) {
                ps.add(cb.equal(car.get("carType"), req.getCarType()));
            }
            if (req.getSeats() != null) {
                ps.add(cb.greaterThanOrEqualTo(car.get("seats"), req.getSeats()));
            }
            if (req.getMaxPricePerHour() != null) {
                ps.add(cb.lessThanOrEqualTo(root.get("pricePerHour"), req.getMaxPricePerHour()));
            }
            if (req.getMaxPricePerDay() != null) {
                ps.add(cb.lessThanOrEqualTo(root.get("pricePerDay"), req.getMaxPricePerDay()));
            }

            if (req.getStartTime() != null && req.getEndTime() != null) {
                ps.add(cb.lessThanOrEqualTo(root.get("startTime"), req.getStartTime()));
                ps.add(cb.greaterThanOrEqualTo(root.get("endTime"), req.getEndTime()));
            }

            if (req.getRentalType() != null) {
                RentalOption exact = req.getRentalType() == RentalType.HOURLY ? RentalOption.HOURLY : RentalOption.DAILY;
                ps.add(root.get("rentalOption").in(exact, RentalOption.BOTH));

                if (req.getRentalType() == RentalType.HOURLY && req.getStartTime() != null && req.getEndTime() != null) {
                    long wholeHours = Duration.between(req.getStartTime(), req.getEndTime()).toMinutes() / 60;
                    ps.add(cb.lessThanOrEqualTo(root.get("minRentalHours"), (int) wholeHours));
                }
            }

            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
