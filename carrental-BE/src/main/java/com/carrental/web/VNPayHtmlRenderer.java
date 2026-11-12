package com.carrental.web;

import com.carrental.dto.response.TransactionResponse;
import java.math.BigDecimal;
import java.util.Locale;
import java.util.Map;
import org.springframework.web.util.HtmlUtils;

/**
 * Trang kết quả sau khi VNPay chuyển hướng về.
 *
 * <p>Thông tin được chia thành các khối rõ ràng (gói đã mua – thanh toán – bước tiếp theo) thay vì
 * một bảng dồn mọi trường, và mọi giá trị đều được escape HTML.
 */
public final class VNPayHtmlRenderer {

    private VNPayHtmlRenderer() {}

    public static String renderResultHtml(TransactionResponse response, Map<String, String> params) {
        return renderResultHtml(response, params, "http://localhost:3000");
    }

    public static String renderResultHtml(TransactionResponse r, Map<String, String> params, String frontendUrl) {
        boolean ok = "SUCCESS".equalsIgnoreCase(r.status());
        String base = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        String subscriptionLink = r.subscriptionId() != null ? base + "/owner/subscriptions/" + r.subscriptionId() : base + "/owner/subscriptions";
        String next = ok
                ? "Gói đăng tin đã được kích hoạt, xe của bạn đang hiển thị trên sàn. Theo dõi thời hạn hiển thị và kích hoạt slot tiếp theo trong mục <b>Gói đăng tin</b>."
                : "Bạn chưa bị trừ tiền cho gói này. Có thể thử thanh toán lại từ mục <b>Gói đăng tin</b>; gói chưa thanh toán sẽ tự huỷ sau 30 phút.";
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                <meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>%s | CarDB</title>
                <style>
                  *{box-sizing:border-box}
                  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;background:#F7F7F5;
                       font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#292929}
                  .card{width:100%%;max-width:520px;background:#fff;border:1px solid #E9E9E7;border-radius:20px;padding:32px 28px;box-shadow:0 10px 30px rgba(0,0,0,.06)}
                  .icon{width:64px;height:64px;border-radius:50%%;display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:32px;font-weight:700}
                  .ok{background:#ECFDF5;color:#047857}.bad{background:#FEF2F2;color:#B91C1C}
                  h1{margin:0;text-align:center;font-size:22px}
                  .lead{margin:6px 0 0;text-align:center;color:#666;font-size:14px}
                  .amount{margin:18px 0 0;text-align:center;font-size:30px;font-weight:800;color:#FC6C26}
                  .block{margin-top:20px;border:1px solid #F1F1EF;border-radius:14px;padding:4px 16px}
                  .block h2{margin:12px 0 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#888}
                  .row{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-top:1px solid #F5F5F3;font-size:14px}
                  .row:first-of-type{border-top:0}.row span{color:#666}.row b{text-align:right;word-break:break-all}
                  .next{margin-top:18px;background:#FFF7F2;border-radius:14px;padding:14px 16px;font-size:14px;line-height:1.55;color:#7C2D12}
                  .actions{display:flex;gap:10px;margin-top:22px;flex-wrap:wrap}
                  .btn{flex:1;min-width:160px;text-align:center;padding:12px 16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px}
                  .primary{background:#FC6C26;color:#fff}.ghost{border:1px solid #E9E9E7;color:#292929}
                </style>
                </head>
                <body><main class="card">
                  <div class="icon %s">%s</div>
                  <h1>%s</h1>
                  <p class="lead">%s</p>
                  <p class="amount">%s</p>
                  <section class="block"><h2>Gói đăng tin</h2>
                    <div class="row"><span>Gói</span><b>%s</b></div>
                    <div class="row"><span>Xe</span><b>%s</b></div>
                    <div class="row"><span>Mã gói</span><b>%s</b></div>
                  </section>
                  <section class="block"><h2>Thanh toán</h2>
                    <div class="row"><span>Mã giao dịch CarDB</span><b>#%s</b></div>
                    <div class="row"><span>Ngân hàng</span><b>%s</b></div>
                    <div class="row"><span>Mã tham chiếu VNPay</span><b>%s</b></div>
                  </section>
                  <div class="next">%s</div>
                  <div class="actions"><a class="btn primary" href="%s">Xem gói đăng tin</a><a class="btn ghost" href="%s/owner/dashboard">Về kênh chủ xe</a></div>
                </main></body></html>
                """.formatted(
                ok ? "Thanh toán thành công" : "Thanh toán chưa thành công",
                ok ? "ok" : "bad", ok ? "✓" : "✕",
                ok ? "Thanh toán thành công" : "Thanh toán chưa thành công",
                ok ? "VNPay đã xác nhận giao dịch của bạn." : "Giao dịch đã bị huỷ hoặc ngân hàng từ chối.",
                money(r.amount()),
                esc(r.packageName()), esc(join(r.carName(), r.carLicensePlate())), esc(r.subscriptionCode()),
                r.id(), esc(params.get("vnp_BankCode")), esc(r.providerRef()),
                next, esc(subscriptionLink), esc(base));
    }

    private static String join(String a, String b) {
        if (a == null) return b;
        return b == null ? a : a + " • " + b;
    }

    private static String money(BigDecimal amount) {
        long value = amount == null ? 0 : amount.longValue();
        return String.format(Locale.ROOT, "%,d đ", value).replace(',', '.');
    }

    private static String esc(String value) {
        return value == null || value.isBlank() ? "—" : HtmlUtils.htmlEscape(value, "UTF-8");
    }
}
