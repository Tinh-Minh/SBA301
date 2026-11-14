package com.carrental.service;
import com.carrental.storage.PublicImageStorageService;

import com.carrental.dto.request.safety.*;
import com.carrental.dto.response.safety.*;
import com.carrental.enums.*;

import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Car;
import com.carrental.entity.CarDocument;
import com.carrental.entity.CarSafetyRecord;
import com.carrental.entity.Customer;
import com.carrental.enums.CarDocumentType;
import com.carrental.enums.CarStatus;
import com.carrental.enums.SafetyRecordResult;
import com.carrental.enums.SafetyRecordType;
import com.carrental.enums.VerificationStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CarDocumentRepository;
import com.carrental.repository.CarRepository;
import com.carrental.repository.CarSafetyRecordRepository;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Hồ sơ an toàn của xe: lịch sử đăng kiểm, bảo hiểm, bảo dưỡng, sửa chữa và bản tóm tắt
 * "xe này có an toàn không" cho khách thuê.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CarSafetyService {

    /** Còn dưới ngần này ngày thì cảnh báo "sắp hết hạn". */
    static final int EXPIRING_SOON_DAYS = 30;

    private final CarSafetyRecordRepository recordRepository;
    private final CarRepository carRepository;
    private final CarDocumentRepository carDocumentRepository;
    private final CurrentUserService currentUserService;
    private final PublicImageStorageService publicImageStorageService;
    private final Clock clock;

    // ------------------------------------------------------------------ đọc

    /** Tóm tắt an toàn. Khách chỉ xem được xe đã duyệt; chủ xe/admin xem bản đầy đủ. */
    @Transactional(readOnly = true)
    public SafetySummaryResponse getSummary(Long carId) {
        Car car = carRepository.findWithOwnerById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
        boolean privileged = currentUserService.optionalCurrentUser()
                .map(u -> currentUserService.isAdmin(u) || currentUserService.isOwner(car, u))
                .orElse(false);
        if (!privileged && car.getStatus() != CarStatus.ACTIVE) {
            throw new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId);
        }
        List<CarSafetyRecord> records = recordRepository.findAllByCarIdOrderByPerformedAtDescIdDesc(carId);
        List<CarDocument> documents = carDocumentRepository.findAllByCarId(carId);
        return summarize(car, records, documents, privileged);
    }

    /** Xe có đăng kiểm/bảo hiểm hết hạn hoặc kiểm định không đạt thì không được nhận đặt. */
    @Transactional(readOnly = true)
    public boolean isUnsafe(Car car) {
        List<CarSafetyRecord> records = recordRepository.findAllByCarIdOrderByPerformedAtDescIdDesc(car.getId());
        List<CarDocument> documents = carDocumentRepository.findAllByCarId(car.getId());
        return summarize(car, records, documents, false).level() == SafetyLevel.UNSAFE;
    }

    @Transactional(readOnly = true)
    public PageResponse<SafetyRecordResponse> adminList(VerificationStatus status, Pageable pageable) {
        Page<CarSafetyRecord> page = status != null
                ? recordRepository.findAllByVerifyStatus(status, pageable)
                : recordRepository.findAllBy(pageable);
        return PageResponse.from(page.map(SafetyRecordResponse::full));
    }

    // ------------------------------------------------------------------ chủ xe

    @Transactional
    public SafetyRecordResponse create(Long carId, SafetyRecordRequest request) {
        Car car = loadOwnedCar(carId);
        CarSafetyRecord record = CarSafetyRecord.builder().car(car).build();
        apply(record, request);
        log.info("Chủ xe thêm bản ghi an toàn carId={}, type={}", carId, request.recordType());
        return SafetyRecordResponse.full(recordRepository.saveAndFlush(record));
    }

    /** Sửa bản ghi: nội dung thay đổi nên phải xác minh lại từ đầu. */
    @Transactional
    public SafetyRecordResponse update(Long carId, Long recordId, SafetyRecordRequest request) {
        loadOwnedCar(carId);
        CarSafetyRecord record = findRecord(carId, recordId);
        apply(record, request);
        record.setVerifyStatus(VerificationStatus.PENDING);
        record.setRejectReason(null);
        record.setVerifiedBy(null);
        record.setVerifiedAt(null);
        return SafetyRecordResponse.full(recordRepository.saveAndFlush(record));
    }

    @Transactional
    public SafetyRecordResponse uploadRecordFile(Long carId, Long recordId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Tệp đính kèm không được để trống");
        }
        loadOwnedCar(carId);
        CarSafetyRecord record = findRecord(carId, recordId);
        String storedUrl = publicImageStorageService.storeImage(file);
        record.setFileUrl(storedUrl);
        record.setVerifyStatus(VerificationStatus.PENDING);
        record.setRejectReason(null);
        record.setVerifiedBy(null);
        record.setVerifiedAt(null);
        log.info("Chủ xe tải tệp chứng từ an toàn carId={}, recordId={}, url={}", carId, recordId, storedUrl);
        return SafetyRecordResponse.full(recordRepository.saveAndFlush(record));
    }

    @Transactional
    public void delete(Long carId, Long recordId) {
        loadOwnedCar(carId);
        CarSafetyRecord record = findRecord(carId, recordId);
        // Bản ghi đã xác minh là một phần lịch sử công khai của xe: không cho chủ xe tự xoá.
        if (record.getVerifyStatus() == VerificationStatus.APPROVED) {
            throw new AppException(HttpStatus.CONFLICT,
                    "Bản ghi đã được xác minh nên không thể xoá. Hãy thêm bản ghi mới nếu có thay đổi");
        }
        recordRepository.delete(record);
    }

    // ------------------------------------------------------------------ admin

    @Transactional
    public SafetyRecordResponse verify(Long carId, Long recordId, SafetyVerifyRequest request) {
        Customer admin = currentUserService.getCurrentUser();
        CarSafetyRecord record = findRecord(carId, recordId);
        if (request.verifyStatus() == VerificationStatus.PENDING) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Kết quả xác minh chỉ có thể là APPROVED hoặc REJECTED");
        }
        if (record.getVerifyStatus() != VerificationStatus.PENDING) {
            throw new AppException(HttpStatus.CONFLICT, "Bản ghi này đã được xử lý");
        }
        boolean rejected = request.verifyStatus() == VerificationStatus.REJECTED;
        if (rejected && (request.rejectReason() == null || request.rejectReason().isBlank())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Vui lòng nhập lý do từ chối");
        }
        record.setVerifyStatus(request.verifyStatus());
        record.setRejectReason(rejected ? request.rejectReason().trim() : null);
        record.setVerifiedBy(admin);
        record.setVerifiedAt(LocalDateTime.now(clock));
        return SafetyRecordResponse.full(recordRepository.saveAndFlush(record));
    }

    // ------------------------------------------------------------------ tóm tắt

    SafetySummaryResponse summarize(Car car, List<CarSafetyRecord> records, List<CarDocument> documents,
                                    boolean privileged) {
        LocalDate today = LocalDate.now(clock);
        // Khách chỉ thấy bản ghi không bị từ chối; chủ xe/admin thấy tất cả.
        List<CarSafetyRecord> visible = records.stream()
                .filter(r -> privileged || r.getVerifyStatus() != VerificationStatus.REJECTED)
                .toList();

        SafetyItem inspection = item(visible, documents, SafetyRecordType.INSPECTION, CarDocumentType.INSPECTION, today);
        SafetyItem insurance = item(visible, documents, SafetyRecordType.INSURANCE, CarDocumentType.INSURANCE, today);

        CarSafetyRecord lastMaintenance = visible.stream()
                .filter(r -> r.getRecordType() == SafetyRecordType.MAINTENANCE)
                .max(Comparator.comparing(CarSafetyRecord::getPerformedAt)).orElse(null);
        Integer latestOdometer = visible.stream().map(CarSafetyRecord::getOdometerKm).filter(Objects::nonNull)
                .max(Integer::compareTo).orElse(null);
        int repairs = (int) visible.stream().filter(r -> r.getRecordType() == SafetyRecordType.REPAIR).count();
        int verified = (int) visible.stream().filter(r -> r.getVerifyStatus() == VerificationStatus.APPROVED).count();
        boolean failedInspection = visible.stream()
                .filter(r -> r.getRecordType() == SafetyRecordType.INSPECTION)
                .max(Comparator.comparing(CarSafetyRecord::getPerformedAt))
                .map(r -> r.getResult() == SafetyRecordResult.FAILED).orElse(false);

        List<String> highlights = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        describe("Đăng kiểm", inspection, highlights, warnings);
        describe("Bảo hiểm", insurance, highlights, warnings);
        if (failedInspection) {
            warnings.add("Lần đăng kiểm gần nhất không đạt");
        }
        if (lastMaintenance != null) {
            highlights.add("Bảo dưỡng gần nhất ngày " + format(lastMaintenance.getPerformedAt())
                    + (lastMaintenance.getOdometerKm() != null ? " tại " + lastMaintenance.getOdometerKm() + " km" : ""));
            long monthsAgo = ChronoUnit.MONTHS.between(lastMaintenance.getPerformedAt(), today);
            if (monthsAgo >= 12) {
                warnings.add("Đã hơn " + monthsAgo + " tháng chưa có bản ghi bảo dưỡng mới");
            }
        } else {
            warnings.add("Chưa có lịch sử bảo dưỡng");
        }
        if (repairs > 0) {
            highlights.add("Có " + repairs + " lần sửa chữa/thay thế đã khai báo");
        }

        SafetyLevel level = level(inspection, insurance, failedInspection);
        String headline = switch (level) {
            case SAFE -> "Đăng kiểm và bảo hiểm còn hiệu lực, đã được CarDB xác minh";
            case ATTENTION -> "Có thông tin cần lưu ý trước khi thuê";
            case UNSAFE -> "Đăng kiểm hoặc bảo hiểm đã hết hạn / không đạt";
            case UNKNOWN -> "Chủ xe chưa cung cấp đủ thông tin đăng kiểm và bảo hiểm";
        };

        return new SafetySummaryResponse(
                car.getId(), level, headline, highlights, warnings, inspection, insurance,
                lastMaintenance != null ? lastMaintenance.getPerformedAt() : null,
                lastMaintenance != null ? lastMaintenance.getOdometerKm() : null,
                lastMaintenance != null ? lastMaintenance.getExpiresAt() : null,
                latestOdometer, repairs, verified, visible.size(),
                visible.stream().map(privileged ? SafetyRecordResponse::full : SafetyRecordResponse::publicView).toList());
    }

    /**
     * Hiệu lực của đăng kiểm/bảo hiểm: lấy bản ghi có hạn xa nhất (ưu tiên bản đã xác minh);
     * nếu chủ xe chưa khai lịch sử thì dùng giấy tờ xe đã nộp khi đăng ký.
     */
    private SafetyItem item(List<CarSafetyRecord> records, List<CarDocument> documents,
                            SafetyRecordType type, CarDocumentType docType, LocalDate today) {
        record Candidate(LocalDate until, boolean verified, String provider) {}
        List<Candidate> candidates = new ArrayList<>();
        for (CarSafetyRecord r : records) {
            if (r.getRecordType() == type && r.getExpiresAt() != null && r.getResult() != SafetyRecordResult.FAILED) {
                candidates.add(new Candidate(r.getExpiresAt(), r.getVerifyStatus() == VerificationStatus.APPROVED, r.getProvider()));
            }
        }
        for (CarDocument d : documents) {
            if (d.getDocType() == docType && d.getExpiresAt() != null && d.getVerifyStatus() != VerificationStatus.REJECTED) {
                candidates.add(new Candidate(d.getExpiresAt(), d.getVerifyStatus() == VerificationStatus.APPROVED, null));
            }
        }
        Candidate best = candidates.stream()
                .max(Comparator.comparing(Candidate::verified).thenComparing(Candidate::until)).orElse(null);
        if (best == null) {
            return new SafetyItem(Validity.MISSING, null, null, false, null);
        }
        long days = ChronoUnit.DAYS.between(today, best.until());
        Validity validity = days < 0 ? Validity.EXPIRED : days <= EXPIRING_SOON_DAYS ? Validity.EXPIRING_SOON : Validity.VALID;
        return new SafetyItem(validity, best.until(), days, best.verified(), best.provider());
    }

    private static void describe(String label, SafetyItem item, List<String> highlights, List<String> warnings) {
        switch (item.validity()) {
            case VALID -> highlights.add(label + " còn hiệu lực đến " + format(item.validUntil())
                    + (item.verified() ? " (đã xác minh)" : " (chủ xe khai báo, chưa xác minh)"));
            case EXPIRING_SOON -> warnings.add(label + " sắp hết hạn: còn " + item.daysRemaining() + " ngày (đến "
                    + format(item.validUntil()) + ")");
            case EXPIRED -> warnings.add(label + " đã hết hạn từ " + format(item.validUntil()));
            case MISSING -> warnings.add("Chưa có thông tin " + label.toLowerCase());
        }
    }

    private static SafetyLevel level(SafetyItem inspection, SafetyItem insurance, boolean failedInspection) {
        if (failedInspection || inspection.validity() == Validity.EXPIRED || insurance.validity() == Validity.EXPIRED) {
            return SafetyLevel.UNSAFE;
        }
        if (inspection.validity() == Validity.MISSING && insurance.validity() == Validity.MISSING) {
            return SafetyLevel.UNKNOWN;
        }
        boolean allValid = inspection.validity() == Validity.VALID && insurance.validity() == Validity.VALID;
        return allValid && inspection.verified() && insurance.verified() ? SafetyLevel.SAFE : SafetyLevel.ATTENTION;
    }

    private static String format(LocalDate date) {
        return date.format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy"));
    }

    // ------------------------------------------------------------------ helpers

    private void apply(CarSafetyRecord record, SafetyRecordRequest request) {
        if (request.expiresAt() != null && request.expiresAt().isBefore(request.performedAt())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Ngày hết hạn phải sau ngày thực hiện");
        }
        boolean needsExpiry = request.recordType() == SafetyRecordType.INSPECTION
                || request.recordType() == SafetyRecordType.INSURANCE;
        if (needsExpiry && request.expiresAt() == null) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Đăng kiểm và bảo hiểm bắt buộc có ngày hết hạn");
        }
        record.setRecordType(request.recordType());
        record.setPerformedAt(request.performedAt());
        record.setExpiresAt(request.expiresAt());
        record.setProvider(blankToNull(request.provider()));
        record.setReferenceNumber(blankToNull(request.referenceNumber()));
        record.setOdometerKm(request.odometerKm());
        record.setResult(request.result() != null ? request.result()
                : request.recordType() == SafetyRecordType.INSPECTION ? SafetyRecordResult.PASSED
                : SafetyRecordResult.NOT_APPLICABLE);
        record.setNote(blankToNull(request.note()));
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private CarSafetyRecord findRecord(Long carId, Long recordId) {
        return recordRepository.findByIdAndCarId(recordId, carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND,
                        "Không tìm thấy bản ghi an toàn id=" + recordId + " của xe id=" + carId));
    }

    private Car loadOwnedCar(Long carId) {
        Customer owner = currentUserService.getCurrentUser();
        CurrentUserService.requireVerifiedOwner(owner);
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy xe id=" + carId));
        if (!currentUserService.isOwner(car, owner)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Bạn không phải chủ của xe này");
        }
        return car;
    }
}
