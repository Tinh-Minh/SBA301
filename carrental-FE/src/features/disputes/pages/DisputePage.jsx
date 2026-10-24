import { Link, useSearchParams } from "react-router";
import { RequireAuth } from "@/shared/components/RequireAuth.jsx";
import { LivePage } from "@/shared/components/LiveUi.jsx";
import { Form } from "@/features/disputes/components/Form.jsx";

export default function DisputeLive() {
    const orderId = useSearchParams()[0].get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để gửi khiếu nại">
      {orderId ? <Form orderId={orderId}/> : <p className="text-sm">Mở khiếu nại từ <Link to="/my-trips" className="font-bold text-[#FC6C26]">chi tiết đơn thuê</Link>.</p>}
    </RequireAuth>
  </LivePage>;
}
