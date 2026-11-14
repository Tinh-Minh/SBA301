package com.carrental.service;

import com.carrental.dto.request.safety.*;
import com.carrental.dto.response.safety.*;
import com.carrental.enums.*;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Car;
import com.carrental.entity.CarDocument;
import com.carrental.entity.CarSafetyRecord;
import java.util.List;
import com.carrental.enums.VerificationStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;
import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

public interface CarSafetyService {

    SafetySummaryResponse getSummary(Long carId);

    boolean isUnsafe(Car car);

    PageResponse<SafetyRecordResponse> adminList(VerificationStatus status, Pageable pageable);

    SafetyRecordResponse create(Long carId, SafetyRecordRequest request);

    SafetyRecordResponse update(Long carId, Long recordId, SafetyRecordRequest request);

    SafetyRecordResponse uploadRecordFile(Long carId, Long recordId, MultipartFile file);

    void delete(Long carId, Long recordId);

    SafetyRecordResponse verify(Long carId, Long recordId, SafetyVerifyRequest request);

    SafetySummaryResponse summarize(Car car, List<CarSafetyRecord> records, List<CarDocument> documents, boolean privileged);
}
