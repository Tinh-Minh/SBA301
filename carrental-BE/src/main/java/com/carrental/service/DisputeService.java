package com.carrental.service;

import com.carrental.dto.request.CreateDisputeRequest;
import com.carrental.dto.request.DisputeEvidenceRequest;
import com.carrental.dto.request.ResolveDisputeRequest;
import com.carrental.dto.response.DisputeEvidenceResponse;
import com.carrental.dto.response.DisputeResponse;
import com.carrental.dto.response.PageResponse;
import com.carrental.entity.Customer;
import com.carrental.entity.Dispute;
import com.carrental.entity.DisputeEvidence;
import com.carrental.entity.ExtraFee;
import com.carrental.entity.RentalOrder;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.exception.AppException;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DisputeRepository;
import com.carrental.repository.ExtraFeeRepository;
import com.carrental.repository.RentalOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;
    private final ExtraFeeRepository extraFeeRepository;

    @Transactional
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        log.info("Mở khiếu nại orderId={}, raisedById={}, reason={}",
                request.getOrderId(), request.getRaisedById(), request.getReason());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer raisedBy = findCustomerOrThrow(request.getRaisedById());

            Dispute dispute = request.toEntity();
            dispute.setOrder(order);
            dispute.setRaisedBy(raisedBy);

            if (request.getExtraFeeId() != null) {
                ExtraFee extraFee = extraFeeRepository.findById(request.getExtraFeeId()).orElse(null);
                if (extraFee != null) {
                    dispute.setExtraFees(extraFee);
                    extraFee.setStatus(ExtraFeeStatus.DISPUTED.name());
                    extraFeeRepository.save(extraFee);
                }
            }

            if (request.getEvidences() != null && !request.getEvidences().isEmpty()) {
                for (DisputeEvidenceRequest evReq : request.getEvidences()) {
                    DisputeEvidence evidence = evReq.toEntity();
                    evidence.setDispute(dispute);
                    Long uploaderId = evReq.getUploadedById() != null ? evReq.getUploadedById() : raisedBy.getId();
                    evidence.setUploadedBy(findCustomerOrThrow(uploaderId));
                    dispute.getEvidences().add(evidence);
                }
            }

            Dispute saved = disputeRepository.save(dispute);
            log.info("Mở khiếu nại thành công id={}", saved.getId());
            return DisputeResponse.from(saved);
        } catch (AppException e) {
            log.warn("Mở khiếu nại thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi mở khiếu nại orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể mở khiếu nại");
        }
    }

    @Transactional
    public DisputeEvidenceResponse addEvidence(Long disputeId, DisputeEvidenceRequest request) {
        log.info("Thêm bằng chứng cho khiếu nại disputeId={}", disputeId);
        try {
            Dispute dispute = findDisputeOrThrow(disputeId);
            Long uploaderId = request.getUploadedById() != null ? request.getUploadedById() : dispute.getRaisedBy().getId();
            Customer uploader = findCustomerOrThrow(uploaderId);

            DisputeEvidence evidence = request.toEntity();
            evidence.setDispute(dispute);
            evidence.setUploadedBy(uploader);

            dispute.getEvidences().add(evidence);
            Dispute saved = disputeRepository.save(dispute);

            DisputeEvidence added = saved.getEvidences().get(saved.getEvidences().size() - 1);
            log.info("Thêm bằng chứng thành công evidenceId={}, disputeId={}", added.getId(), disputeId);
            return DisputeEvidenceResponse.from(added);
        } catch (AppException e) {
            log.warn("Thêm bằng chứng thất bại disputeId={}: {}", disputeId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi thêm bằng chứng disputeId={}", disputeId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể thêm bằng chứng khiếu nại");
        }
    }

    @Transactional
    public DisputeResponse resolveDispute(Long disputeId, ResolveDisputeRequest request) {
        log.info("Giải quyết khiếu nại disputeId={}, nextStatus={}", disputeId, request.getStatus());
        try {
            Dispute dispute = findDisputeOrThrow(disputeId);
            if (request.getResolvedById() != null) {
                Customer resolver = findCustomerOrThrow(request.getResolvedById());
                dispute.setResolvedBy(resolver);
            }

            request.applyTo(dispute);
            Dispute saved = disputeRepository.save(dispute);
            log.info("Giải quyết khiếu nại thành công id={}, status={}", saved.getId(), saved.getStatus());
            return DisputeResponse.from(saved);
        } catch (AppException e) {
            log.warn("Giải quyết khiếu nại thất bại disputeId={}: {}", disputeId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi giải quyết khiếu nại disputeId={}", disputeId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể giải quyết khiếu nại");
        }
    }

    @Transactional(readOnly = true)
    public DisputeResponse getById(Long id) {
        return DisputeResponse.from(findDisputeOrThrow(id));
    }

    @Transactional(readOnly = true)
    public PageResponse<DisputeResponse> getPaged(Long orderId, Long raisedById, String status, Pageable pageable) {
        Page<Dispute> page;
        if (orderId != null) {
            page = disputeRepository.findByOrderId(orderId, pageable);
        } else if (raisedById != null) {
            page = disputeRepository.findByRaisedById(raisedById, pageable);
        } else if (status != null && !status.isBlank()) {
            page = disputeRepository.findByStatus(status, pageable);
        } else {
            page = disputeRepository.findAll(pageable);
        }
        return PageResponse.from(page.map(DisputeResponse::from));
    }

    private Dispute findDisputeOrThrow(Long id) {
        return disputeRepository.findById(id)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy khiếu nại id=" + id));
    }

    private RentalOrder findOrderOrThrow(Long orderId) {
        return rentalOrderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn thuê id=" + orderId));
    }

    private Customer findCustomerOrThrow(Long customerId) {
        return customerRepository.findById(customerId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng id=" + customerId));
    }
}
