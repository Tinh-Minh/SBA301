import { Suspense } from "react";
import PaymentLive from "@/views/live/PaymentLive";

export const metadata = { title: "Thanh toán tiền thuê xe" };

export default function Page() {
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang mở thanh toán…</p>}><PaymentLive /></Suspense>;
}
