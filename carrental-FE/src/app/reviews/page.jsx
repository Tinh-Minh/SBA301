import { Suspense } from "react";
import ReviewLive from "@/pages/user/ReviewLivePage.jsx";

export const metadata = { title: "Đánh giá chuyến thuê" };

export default function Page() {
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang mở đánh giá…</p>}><ReviewLive /></Suspense>;
}
