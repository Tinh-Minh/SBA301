package com.carrental.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.carrental.dto.response.TransactionResponse;
import com.carrental.service.VNPayService;
import java.math.BigDecimal;
import java.net.URI;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class VNPayCallbackControllerTest {

    private static TransactionResponse txResponse(String status, String providerRef) {
        return new TransactionResponse(
                9L, 4L, "SUB-004", 1L, "51K-12345", "Honda City", "Honda City", "Gói Trung",
                "PACKAGE_PAYMENT", BigDecimal.valueOf(250000), "VNPAY", status, providerRef, null, null, null);
    }

    @Test
    void successfulBrowserReturnRedirectsToOwnerSubscriptions() {
        VNPayService vnPayService = mock(VNPayService.class);
        Map<String, String> params = Map.of("vnp_TxnRef", "9_1", "vnp_ResponseCode", "00");
        when(vnPayService.processReturn(params)).thenReturn(txResponse("SUCCESS", "VNPAY_1"));

        VNPayCallbackController controller = new VNPayCallbackController(vnPayService);
        var response = controller.handleVNPayReturn(params, "text/html", "");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FOUND);
        assertThat(response.getHeaders().getLocation()).isEqualTo(URI.create("http://localhost:3000/owner/subscriptions"));
    }

    @Test
    void failedBrowserReturnRendersHtmlWithOwnerSubscriptionsLink() {
        VNPayService vnPayService = mock(VNPayService.class);
        Map<String, String> params = Map.of("vnp_TxnRef", "9_1", "vnp_ResponseCode", "24");
        when(vnPayService.processReturn(params)).thenReturn(txResponse("FAILED", null));

        VNPayCallbackController controller = new VNPayCallbackController(vnPayService);
        var response = controller.handleVNPayReturn(params, "text/html", "");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(String.valueOf(response.getBody()))
                .contains("http://localhost:3000/owner/subscriptions")
                .doesNotContain("http://localhost:3000/my-subscriptions");
    }

    @Test
    void jsonReturnKeepsJsonApiResponse() {
        VNPayService vnPayService = mock(VNPayService.class);
        Map<String, String> params = Map.of("vnp_TxnRef", "9_1", "vnp_ResponseCode", "00");
        when(vnPayService.processReturn(params)).thenReturn(txResponse("SUCCESS", "VNPAY_1"));

        VNPayCallbackController controller = new VNPayCallbackController(vnPayService);
        var response = controller.handleVNPayReturn(params, "application/json", "");

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
