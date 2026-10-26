import { Link, useSearchParams } from "react-router";
import { RequireAuth } from "@/shared/components/RequireAuth.jsx";
import { LivePage } from "@/shared/components/LiveUi.jsx";
import { OwnerReviewForm } from "@/features/reviews/components/OwnerReviewForm.jsx";

export default function OwnerReviewPage() {
    const orderId = useSearchParams()[0].get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để đánh giá">
      {orderId ? <OwnerReviewForm orderId={orderId}/> : <p className="text-sm">Chọn đơn đã hoàn thành trong <Link to="/account/history" className="font-bold text-[#FC6C26]">lịch sử chuyến đi</Link>.</p>}
    </RequireAuth>
  </LivePage>;
}
