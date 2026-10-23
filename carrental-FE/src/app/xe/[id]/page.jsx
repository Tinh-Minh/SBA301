import { Suspense } from "react";
import { redirect } from "next/navigation";
import CarDetail from "@/views/live/CarDetail";

export const metadata = { title: "Chi tiết xe" };

export default async function Page({ params }) {
    const { id } = await params;
    if (!/^\d+$/.test(id))
        redirect("/kham-pha-xe");
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang tải xe…</p>}><CarDetail carId={id} /></Suspense>;
}
