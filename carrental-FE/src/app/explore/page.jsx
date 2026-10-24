import { Suspense } from "react";
import ExploreCars from "@/pages/user/ExploreCarsPage.jsx";

export const metadata = { title: "Khám phá xe" };

export default function Page() {
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang mở danh sách xe…</p>}><ExploreCars /></Suspense>;
}
