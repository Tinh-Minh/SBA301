import { Suspense } from "react";
import DisputeLive from "@/views/live/DisputeLive";

export const metadata = { title: "Tranh chấp và bằng chứng" };

export default function Page() {
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang mở khiếu nại…</p>}><DisputeLive /></Suspense>;
}
