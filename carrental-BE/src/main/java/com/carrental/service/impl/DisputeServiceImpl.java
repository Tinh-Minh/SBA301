package com.carrental.service.impl;

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
import com.carrental.enums.DisputeStatus;
import com.carrental.enums.ExtraFeeStatus;
import com.carrental.exception.AppException;
import com.carrental.security.OrderAccess;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DisputeEvidenceRepository;
import com.carrental.repository.DisputeRepository;
import com.carrental.repository.ExtraFeeRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.service.DisputeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeEvidenceRepository disputeEvidenceRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;
    private final ExtraFeeRepository extraFeeRepository;
    private final OrderAccess orderAccess;

    @Override
    @Transactional
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        log.info("Mở khiếu nại orderId={}, raisedById={}, reason={}",
                request.getOrderId(), request.getRaisedById(), request.getReason());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer raisedBy = orderAccess.requireUser();
            orderAccess.requireSelf(request.getRaisedById());
            if (!orderAccess.isRenter(order, raisedBy) && !orderAccess.isOwner(order, raisedBy)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Chỉ người thuê hoặc chủ xe của đơn này được mở khiếu nại");
            }

            Dispute dispute = request.toEntity();
            dispute.setOrder(order);
            dispute.setRaisedBy(raisedBy);

            if (request.getExtraFeeId() != null) {
                ExtraFee extraFee = extraFeeRepository.findById(request.getExtraFeeId()).orElse(null);
                if (extraFee != null) {
                    dispute.setExtraFee(extraFee);
                    extraFee.setStatus(ExtraFeeStatus.DISPUTED);
                    extraFeeRepository.save(extraFee);
                }
            }

            Dispute saved = disputeRepository.save(dispute);

            List<DisputeEvidence> savedEvidences = new ArrayList<>();
            if (request.getEvidences() != null && !request.getEvidences().isEmpty()) {
                for (DisputeEvidenceRequest evReq : request.getEvidences()) {
                    DisputeEvidence evidence = evReq.toEntity();
                    evidence.setDispute(saved);
                    Long uploaderId = evReq.getUploadedById() != null ? evReq.getUploadedById() : raisedBy.getId();
                    evidence.setUploadedBy(findCustomerOrThrow(uploaderId));
                    savedEvidences.add(disputeEvidenceRepository.save(evidence));
                }
            }

            log.info("Mở khiếu nại thành công id={}", saved.getId());
            return DisputeResponse.from(saved, savedEvidences);
        } catch (AppException e) {
            log.warn("Mở khiếu nại thất bại orderId={}: {}", request.getOrderId(), e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi mở khiếu nại orderId={}", request.getOrderId(), e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể mở khiếu nại");
        }
    }

    @Override
    @Transactional
    public DisputeEvidenceResponse addEvidence(Long disputeId, DisputeEvidenceRequest request) {
        log.info("Thêm bằng chứng cho khiếu nại disputeId={}", disputeId);
        try {
            Dispute dispute = findDisputeOrThrow(disputeId);
            orderAccess.requireParty(dispute.getOrder());
            orderAccess.requireSelf(request.getUploadedById());
            Customer uploader = orderAccess.requireUser();

            DisputeEvidence evidence = request.toEntity();
            evidence.setDispute(dispute);
            evidence.setUploadedBy(uploader);

            DisputeEvidence added = disputeEvidenceRepository.save(evidence);
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

    @Override
    @Transactional
    public DisputeResponse resolveDispute(Long disputeId, ResolveDisputeRequest request) {
        log.info("Giải quyết khiếu nại disputeId={}, nextStatus={}", disputeId, request.getStatus());
        try {
            Dispute dispute = findDisputeOrThrow(disputeId);
            orderAccess.requireAdmin();
            orderAccess.requireSelf(request.getResolvedById());
            dispute.setResolvedBy(orderAccess.requireUser());

            request.applyTo(dispute);
            Dispute saved = disputeRepository.save(dispute);
            List<DisputeEvidence> evidences = disputeEvidenceRepository.findByDisputeId(saved.getId());
            log.info("Giải quyết khiếu nại thành công id={}, status={}", saved.getId(), saved.getStatus());
            return DisputeResponse.from(saved, evidences);
        } catch (AppException e) {
            log.warn("Giải quyết khiếu nại thất bại disputeId={}: {}", disputeId, e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi giải quyết khiếu nại disputeId={}", disputeId, e);
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể giải quyết khiếu nại");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public DisputeResponse getById(Long id) {
        Dispute dispute = findDisputeOrThrow(id);
        orderAccess.requireParty(dispute.getOrder());
        List<DisputeEvidence> evidences = disputeEvidenceRepository.findByDisputeId(id);
        return DisputeResponse.from(dispute, evidences);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<DisputeResponse> getPaged(Long orderId, Long raisedById, String status, Pageable pageable) {
        Customer user = orderAccess.requireUser();
        if (orderId != null) {
            orderAccess.requireParty(findOrderOrThrow(orderId));
        } else if (raisedById != null) {
            if (!orderAccess.isAdmin(user) && !raisedById.equals(user.getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ xem được khiếu nại của mình");
            }
        } else if (!orderAccess.isAdmin(user)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Chỉ admin được xem toàn bộ khiếu nại");
        }
        Page<Dispute> page;
        if (orderId != null) {
            page = disputeRepository.findByOrderId(orderId, pageable);
        } else if (raisedById != null) {
            page = disputeRepository.findByRaisedById(raisedById, pageable);
        } else if (status != null && !status.isBlank()) {
            DisputeStatus disputeStatus = DisputeStatus.valueOf(status.toUpperCase());
            page = disputeRepository.findByStatus(disputeStatus, pageable);
        } else {
            page = disputeRepository.findAll(pageable);
        }
        return PageResponse.from(page.map(d -> {
            List<DisputeEvidence> evidences = disputeEvidenceRepository.findByDisputeId(d.getId());
            return DisputeResponse.from(d, evidences);
        }));
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
