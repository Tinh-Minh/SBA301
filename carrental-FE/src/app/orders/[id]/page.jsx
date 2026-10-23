import { Suspense } from "react";
import { OrderDetailPage } from "@/views/live/OrderDetail";

export const metadata = { title: "Chi tiết đơn thuê" };

export default async function Page({ params }) {
    const { id } = await params;
    return <Suspense fallback={<p className="px-6 pt-28 text-sm text-[#666666]">Đang tải đơn…</p>}><OrderDetailPage orderId={id} /></Suspense>;
}
