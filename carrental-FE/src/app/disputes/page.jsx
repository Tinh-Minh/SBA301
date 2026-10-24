import { Suspense } from "react";
import DisputeLive from "@/pages/user/DisputeLivePage.jsx";

export const metadata = { title: "Tranh chấp và bằng chứng" };

export default function Page() {
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang mở khiếu nại…</p>}><DisputeLive /></Suspense>;
}
