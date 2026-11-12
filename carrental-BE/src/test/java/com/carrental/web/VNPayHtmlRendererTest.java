package com.carrental.web;

import static org.assertj.core.api.Assertions.assertThat;

import com.carrental.dto.response.TransactionResponse;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Map;
import org.junit.jupiter.api.Test;

class VNPayHtmlRendererTest {

    private static TransactionResponse tx(String status, String pkg) {
        return new TransactionResponse(9L, 3L, "SUB-202611-0003", 1L, "51K-12345", "Honda City RS", "Honda City RS",
                pkg, "PACKAGE_PAYMENT", new BigDecimal("230000"), "VNPAY", status, "VNPAY_14512", LocalDateTime.now(),
                LocalDateTime.now(), null, "ACTIVE");
    }

    @Test
    void successPageGroupsInformationAndLinksToTheSubscription() throws Exception {
        String html = VNPayHtmlRenderer.renderResultHtml(tx("SUCCESS", "Gói Trung"), Map.of("vnp_BankCode", "NCB"),
                "http://localhost:3000/");
        assertThat(html).contains("Thanh toán thành công", "230.000 đ", "Gói Trung", "Honda City RS • 51K-12345",
                "http://localhost:3000/owner/subscriptions/3", "Gói đăng tin", "Thanh toán")
                .doesNotContain("PACKAGE_PAYMENT", "/my-subscriptions");
        Files.writeString(Path.of("target/vnpay-success-preview.html"), html);
    }

    @Test
    void valuesAreHtmlEscaped() {
        String html = VNPayHtmlRenderer.renderResultHtml(tx("FAILED", "<script>x</script>"), Map.of(), "http://x");
        assertThat(html).contains("&lt;script&gt;").doesNotContain("<script>x").contains("chưa thành công");
    }
}
