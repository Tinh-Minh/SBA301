import { Link, useSearchParams } from "react-router";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { LivePage } from "@/components/LiveUi.jsx";
import { Form } from "@/components/disputes/components/DisputeForm.jsx";

export default function DisputeLive() {
    const orderId = useSearchParams()[0].get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để gửi khiếu nại">
      {orderId ? <Form orderId={orderId}/> : <p className="text-sm">Mở khiếu nại từ <Link to="/my-trips" className="font-bold text-[#FC6C26]">chi tiết đơn thuê</Link>.</p>}
    </RequireAuth>
  </LivePage>;
}
