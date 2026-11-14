package com.carrental.controller;

import com.carrental.dto.request.*;
import com.carrental.dto.response.*;

import com.carrental.dto.response.ApiResponse;
import com.carrental.entity.SettlementSlip.SlipStatus;
import com.carrental.entity.SettlementSlip.SlipType;
import com.carrental.service.SettlementService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/** Phiếu hoàn tiền / chi trả / phạt. */
@RestController
@RequiredArgsConstructor
public class SettlementController {

    private final SettlementService settlementService;

    /** Phiếu tiền của người đang đăng nhập (khách xem phiếu hoàn, chủ xe xem chi trả và phạt). */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/api/settlements/my")
    public ApiResponse<List<SlipResponse>> mine() {
        return ApiResponse.ok(settlementService.mine());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/api/admin/settlements")
    public ApiResponse<List<SlipResponse>> adminList(@RequestParam(required = false) SlipType type,
                                                     @RequestParam(required = false) SlipStatus status) {
        return ApiResponse.ok(settlementService.adminList(type, status));
    }

    /** Body: {"referenceCode": "mã giao dịch ngân hàng", "note": "..."} */
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/api/admin/settlements/{id}/complete")
    public ApiResponse<SlipResponse> complete(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ApiResponse.ok("Đã xác nhận chuyển tiền", settlementService.complete(id, body.get("referenceCode"), body.get("note")));
    }
}
