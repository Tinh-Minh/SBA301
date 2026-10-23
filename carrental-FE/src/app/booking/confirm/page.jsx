import { Suspense } from "react";
import Checkout from "@/views/live/Checkout";

export const metadata = { title: "Xác nhận yêu cầu thuê xe" };

export default function Page() {
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang tính giá…</p>}><Checkout /></Suspense>;
}
