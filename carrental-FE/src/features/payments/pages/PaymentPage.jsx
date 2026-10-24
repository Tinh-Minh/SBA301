import { Link, useSearchParams } from "react-router";
import { RequireAuth } from "@/shared/components/RequireAuth.jsx";
import { LivePage } from "@/shared/components/LiveUi.jsx";
import { Pay } from "@/features/payments/components/Pay.jsx";

export default function PaymentLive() {
    const orderId = useSearchParams()[0].get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để thanh toán">
      {orderId ? <Pay orderId={orderId}/> : <p className="text-sm">Thiếu mã đơn. Mở thanh toán từ <Link to="/my-trips" className="font-bold text-[#FC6C26]">chuyến xe của tôi</Link>.</p>}
    </RequireAuth>
  </LivePage>;
}
