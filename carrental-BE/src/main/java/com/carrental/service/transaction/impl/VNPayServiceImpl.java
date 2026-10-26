package com.carrental.service.transaction.impl;

import com.carrental.config.VNPayConfig;
import com.carrental.dto.response.TransactionResponse;
import com.carrental.entity.Transaction;
import com.carrental.enums.TransactionStatus;
import com.carrental.event.PaymentCompletedEvent;
import com.carrental.exception.AppException;
import com.carrental.repository.transaction.TransactionRepository;
import com.carrental.service.transaction.VNPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayServiceImpl implements VNPayService {

    private final VNPayConfig vnPayConfig;
    private final TransactionRepository transactionRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final DateTimeFormatter VNP_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    @Override
    @Transactional(readOnly = true)
    public String createPaymentUrl(Long transactionId, String bankCode, HttpServletRequest request) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch id=" + transactionId));

        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền giao dịch không hợp lệ");
        }

        long amount = transaction.getAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String txnRef = transaction.getId() + "_" + System.currentTimeMillis();

        LocalDateTime now = LocalDateTime.now();
        String createDate = now.format(VNP_DATE_FORMATTER);
        String expireDate = now.plusMinutes(15).format(VNP_DATE_FORMATTER);

        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        if (bankCode != null && !bankCode.isBlank()) {
            vnpParams.put("vnp_BankCode", bankCode);
        }
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang ORD-" + (transaction.getOrder() != null ? transaction.getOrder().getOrderCode() : transaction.getId()));
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", vnPayConfig.getIpAddress(request));
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        vnpParams.forEach((k, v) -> {
            if (v != null && !v.isEmpty()) {
                try {
                    String encodedKey = URLEncoder.encode(k, StandardCharsets.US_ASCII.toString());
                    String encodedValue = URLEncoder.encode(v, StandardCharsets.US_ASCII.toString());

                    if (hashData.length() > 0) {
                        hashData.append('&');
                        query.append('&');
                    }
                    hashData.append(encodedKey).append('=').append(encodedValue);
                    query.append(encodedKey).append('=').append(encodedValue);
                } catch (Exception ignored) {}
            }
        });

        String secureHash = vnPayConfig.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        String paymentUrl = vnPayConfig.getPayUrl() + "?" + query.toString() + "&vnp_SecureHash=" + secureHash;

        log.info("Khởi tạo VNPay paymentUrl cho giao dịch id={}, txnRef={}", transaction.getId(), txnRef);
        return paymentUrl;
    }

    @Override
    @Transactional
    public TransactionResponse processReturn(Map<String, String> queryParams) {
        String txnRef = queryParams.get("vnp_TxnRef");
        Long transactionId = extractTransactionId(txnRef);

        // Khóa pessimistic lock để ngăn race condition giữa Return URL và IPN
        Transaction transaction = transactionRepository.findByIdForUpdate(transactionId)
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy giao dịch từ vnp_TxnRef=" + txnRef));

        String responseCode = queryParams.get("vnp_ResponseCode");
        String transactionStatus = queryParams.get("vnp_TransactionStatus");
        String transactionNo = queryParams.get("vnp_TransactionNo");

        log.info("Xử lý VNPay Return cho giao dịch id={}, responseCode={}, transactionNo={}",
                transactionId, responseCode, transactionNo);

        validateChecksum(queryParams);

        String vnpAmountStr = queryParams.get("vnp_Amount");
        if (vnpAmountStr != null && !vnpAmountStr.isBlank()) {
            try {
                long vnpAmount = Long.parseLong(vnpAmountStr) / 100;
                if (transaction.getAmount().longValue() != vnpAmount) {
                    log.warn("Số tiền thanh toán VNPay không khớp: DB={}, VNPay={}", transaction.getAmount(), vnpAmount);
                    throw new AppException(HttpStatus.BAD_REQUEST, "Số tiền thanh toán không khớp với giao dịch");
                }
            } catch (NumberFormatException ignored) {}
        }

        if ("00".equals(responseCode) && ("00".equals(transactionStatus) || transactionStatus == null)) {
            if (transaction.getStatus() == TransactionStatus.PENDING) {
                transaction.setStatus(TransactionStatus.SUCCESS);
                transaction.setPaidAt(LocalDateTime.now());
                transaction.setProviderRef("VNPAY_" + (transactionNo != null ? transactionNo : txnRef));
                transaction.setUpdatedAt(LocalDateTime.now());
                Transaction saved = transactionRepository.save(transaction);
                eventPublisher.publishEvent(new PaymentCompletedEvent(saved));
                transaction = saved;
            }
        } else {
            if (transaction.getStatus() == TransactionStatus.PENDING) {
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setUpdatedAt(LocalDateTime.now());
                transaction = transactionRepository.save(transaction);
            }
        }

        return TransactionResponse.from(transaction);
    }

    @Override
    @Transactional
    public Map<String, String> processIpn(Map<String, String> queryParams) {
        Map<String, String> response = new HashMap<>();
        try {
            String txnRef = queryParams.get("vnp_TxnRef");
            Long transactionId = extractTransactionId(txnRef);

            // Khóa pessimistic lock để đảm bảo tính tuần tự khi IPN và Return cùng tới
            Optional<Transaction> opt = transactionRepository.findByIdForUpdate(transactionId);
            if (opt.isEmpty()) {
                response.put("RspCode", "01");
                response.put("Message", "Order not found");
                return response;
            }

            Transaction transaction = opt.get();
            validateChecksum(queryParams);

            String vnpAmountStr = queryParams.get("vnp_Amount");
            long vnpAmount = vnpAmountStr != null ? Long.parseLong(vnpAmountStr) / 100 : 0;
            if (transaction.getAmount().longValue() != vnpAmount) {
                response.put("RspCode", "04");
                response.put("Message", "Invalid Amount");
                return response;
            }

            if (transaction.getStatus() != TransactionStatus.PENDING) {
                response.put("RspCode", "02");
                response.put("Message", "Order already confirmed");
                return response;
            }

            String responseCode = queryParams.get("vnp_ResponseCode");
            String transactionStatus = queryParams.get("vnp_TransactionStatus");
            String transactionNo = queryParams.get("vnp_TransactionNo");

            if ("00".equals(responseCode) && ("00".equals(transactionStatus) || transactionStatus == null)) {
                transaction.setStatus(TransactionStatus.SUCCESS);
                transaction.setPaidAt(LocalDateTime.now());
                transaction.setProviderRef("VNPAY_" + transactionNo);
                transaction.setUpdatedAt(LocalDateTime.now());
                Transaction saved = transactionRepository.save(transaction);
                eventPublisher.publishEvent(new PaymentCompletedEvent(saved));
            } else {
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setUpdatedAt(LocalDateTime.now());
                transactionRepository.save(transaction);
            }

            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
            return response;
        } catch (AppException e) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
            return response;
        } catch (Exception e) {
            response.put("RspCode", "99");
            response.put("Message", "Unknown error: " + e.getMessage());
            return response;
        }
    }

    private void validateChecksum(Map<String, String> queryParams) {
        String secureHash = queryParams.get("vnp_SecureHash");
        if (secureHash == null || secureHash.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thiếu chữ ký bảo mật vnp_SecureHash");
        }

        Map<String, String> fields = new TreeMap<>();
        queryParams.forEach((k, v) -> {
            if (k != null && k.startsWith("vnp_") && !k.equals("vnp_SecureHash") && !k.equals("vnp_SecureHashType")) {
                fields.put(k, v);
            }
        });

        String calculatedHash = vnPayConfig.hashAllFields(fields);
        if (!secureHash.equalsIgnoreCase(calculatedHash)) {
            log.warn("Sai lệch chữ ký VNPay: nhận được={}, tính toán={}", secureHash, calculatedHash);
            throw new AppException(HttpStatus.BAD_REQUEST, "Chữ ký bảo mật VNPay không hợp lệ");
        }
    }

    private Long extractTransactionId(String txnRef) {
        if (txnRef == null || txnRef.isBlank()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Thiếu mã vnp_TxnRef");
        }
        try {
            return Long.parseLong(txnRef.contains("_") ? txnRef.split("_")[0] : txnRef);
        } catch (NumberFormatException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Định dạng vnp_TxnRef không hợp lệ: " + txnRef);
        }
    }
}
