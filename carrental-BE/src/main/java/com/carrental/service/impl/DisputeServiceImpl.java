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
import com.carrental.service.OrderAccess;
import com.carrental.repository.CustomerRepository;
import com.carrental.repository.DisputeEvidenceRepository;
import com.carrental.dto.request.RefundRequest;
import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.enums.TransactionType;
import com.carrental.repository.DisputeRepository;
import com.carrental.repository.DisputeSpecification;
import com.carrental.repository.ExtraFeeRepository;
import com.carrental.repository.RentalOrderRepository;
import com.carrental.repository.TransactionRepository;
import com.carrental.service.DisputeService;
import com.carrental.service.TransactionService;
import com.carrental.util.TimeUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DisputeServiceImpl implements DisputeService {

    private final DisputeRepository disputeRepository;
    private final DisputeEvidenceRepository disputeEvidenceRepository;
    private final RentalOrderRepository rentalOrderRepository;
    private final CustomerRepository customerRepository;
    private final ExtraFeeRepository extraFeeRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final OrderAccess orderAccess;

    @Override
    @Transactional
    public DisputeResponse createDispute(CreateDisputeRequest request) {
        log.info("Mở khiếu nại orderId={}, raisedById={}, reason={}",
                request.getOrderId(), request.getRaisedById(), request.getReason());
        try {
            RentalOrder order = findOrderOrThrow(request.getOrderId());
            Customer current = orderAccess.requireUser();
            if (!orderAccess.isRenter(order, current) && !orderAccess.isOwner(order, current)) {
                throw new AppException(HttpStatus.FORBIDDEN, "Chỉ người thuê hoặc chủ xe của đơn này mới được mở khiếu nại");
            }

            ExtraFee extraFee = null;
            if (request.getExtraFeeId() != null) {
                extraFee = extraFeeRepository.findById(request.getExtraFeeId())
                        .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy phí phát sinh id=" + request.getExtraFeeId()));
                extraFee.setStatus(ExtraFeeStatus.DISPUTED);
                extraFeeRepository.save(extraFee);
            }

            Dispute dispute = request.toEntity(order, current, extraFee);
            Dispute saved = disputeRepository.save(dispute);

            List<DisputeEvidence> savedEvidences = new ArrayList<>();
            if (request.getEvidences() != null && !request.getEvidences().isEmpty()) {
                for (DisputeEvidenceRequest evReq : request.getEvidences()) {
                    DisputeEvidence evidence = evReq.toEntity(saved, current);
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
            Customer current = orderAccess.requireUser();

            DisputeEvidence evidence = request.toEntity(dispute, current);
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
            Customer current = orderAccess.requireUser();
            dispute.setResolvedBy(current);

            request.applyTo(dispute);
            Dispute saved = disputeRepository.save(dispute);

            // Nếu giải quyết thành công khiếu nại về phụ phí đang PENDING -> tự động miễn trừ phí phát sinh
            if (saved.getStatus() == DisputeStatus.RESOLVED && saved.getExtraFee() != null) {
                if (saved.getExtraFee().getStatus() == ExtraFeeStatus.PENDING) {
                    saved.getExtraFee().setStatus(ExtraFeeStatus.WAIVED);
                    extraFeeRepository.save(saved.getExtraFee());
                    log.info("Tự động miễn trừ phí phát sinh id={} theo kết quả khiếu nại id={}",
                            saved.getExtraFee().getId(), saved.getId());
                }
            }

            // Tự động kích hoạt tạo giao dịch REFUND hoàn tiền cho khách theo số tiền approvedAmount mà Admin phê duyệt
            if (request.getApprovedAmount() != null && request.getApprovedAmount().compareTo(BigDecimal.ZERO) > 0) {
                log.info("Kích hoạt tạo giao dịch REFUND tự động cho khiếu nại id={}, approvedAmount={}",
                        saved.getId(), request.getApprovedAmount());

                Transaction parentTx = null;
                if (saved.getExtraFee() != null) {
                    parentTx = transactionRepository.findByExtraFeeId(saved.getExtraFee().getId()).stream()
                            .filter(t -> t.getStatus() == TransactionStatus.SUCCESS)
                            .findFirst().orElse(null);
                }
                if (parentTx == null) {
                    parentTx = transactionRepository.findByOrderId(saved.getOrder().getId()).stream()
                            .filter(t -> t.getStatus() == TransactionStatus.SUCCESS && t.getTransactionType() != TransactionType.REFUND)
                            .findFirst().orElse(null);
                }

                if (parentTx != null) {
                    String reason = "Hoàn tiền theo phán quyết giải quyết khiếu nại #" + saved.getId()
                            + (request.getResolutionNote() != null ? ": " + request.getResolutionNote() : "");
                    transactionService.refund(RefundRequest.of(parentTx.getId(), request.getApprovedAmount(), reason));
                    log.info("Tạo giao dịch hoàn tiền tự động thành công cho khiếu nại id={}", saved.getId());
                } else {
                    log.warn("Không tìm thấy giao dịch gốc SUCCESS để hoàn tiền cho khiếu nại id={}", saved.getId());
                }
            }

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
        Long effectiveRaisedById = raisedById;

        if (orderId != null) {
            orderAccess.requireParty(findOrderOrThrow(orderId));
        } else if (!orderAccess.isAdmin(user)) {
            if (effectiveRaisedById != null && !effectiveRaisedById.equals(user.getId())) {
                throw new AppException(HttpStatus.FORBIDDEN, "Bạn chỉ xem được khiếu nại của mình");
            }
            effectiveRaisedById = user.getId();
        }

        Specification<Dispute> spec = DisputeSpecification.filter(orderId, effectiveRaisedById, status);
        Page<Dispute> page = disputeRepository.findAll(spec, pageable);

        // Batch fetch evidences để triệt tiêu hoàn toàn lỗi N+1 query
        List<Long> disputeIds = page.getContent().stream().map(Dispute::getId).toList();
        Map<Long, List<DisputeEvidence>> evidenceMap = new HashMap<>();
        if (!disputeIds.isEmpty()) {
            List<DisputeEvidence> allEvidences = disputeEvidenceRepository.findByDisputeIdIn(disputeIds);
            evidenceMap = allEvidences.stream().collect(Collectors.groupingBy(e -> e.getDispute().getId()));
        }
        final Map<Long, List<DisputeEvidence>> finalEvidenceMap = evidenceMap;
        return PageResponse.from(page.map(d -> DisputeResponse.from(d, finalEvidenceMap.getOrDefault(d.getId(), Collections.emptyList()))));
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
