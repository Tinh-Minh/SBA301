import { useState } from "react";
import { LiveState } from "@/components/LiveUi.jsx";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { TripCard, nextAction } from "@/components/booking/TripParts.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { ownerRoutes } from "@/routes/paths.js";
import { tripService } from "@/services/tripService.js";

const tabs = [
    { id: "todo", label: "Cần xử lý", match: b => Boolean(nextAction(b, "owner")) },
    { id: "requested", label: "Yêu cầu mới", match: b => b.status === "REQUESTED" },
    { id: "upcoming", label: "Đã xác nhận", match: b => b.status === "CONFIRMED" },
    { id: "active", label: "Đang thuê", match: b => ["PICKUP_PENDING", "IN_PROGRESS", "RETURN_PENDING"].includes(b.status) },
    { id: "done", label: "Hoàn tất", match: b => b.status === "COMPLETED" },
    { id: "closed", label: "Huỷ / từ chối", match: b => ["CANCELLED", "REJECTED", "EXPIRED"].includes(b.status) },
];

export default function OwnerBookingsPage() {
    const list = useApiQuery(["owner", "bookings"], tripService.ownerList);
    const [tab, setTab] = useState("todo");
    const rows = list.data ?? [];
    const visible = rows.filter(tabs.find(t => t.id === tab).match);
    return <div className="flex min-w-0 flex-col gap-5">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Đơn thuê xe"/>
      <OwnerHeading title="Đơn thuê xe" description="Liên hệ khách, xác nhận đơn và lập biên bản nhận/trả xe có ảnh để hai bên cùng xác nhận."/>
    </div>
    <div className="flex flex-wrap gap-2">{tabs.map(t => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${tab === t.id ? "bg-[#FC6C26] text-white" : "bg-white text-[#292929]"}`}>{t.label} ({rows.filter(t.match).length})</button>)}</div>
    <LiveState loading={list.loading && !list.data} error={list.error} empty={!!list.data && !visible.length} label="đơn thuê trong mục này" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">{visible.map(b => <TripCard key={b.id} booking={b} role="owner" highlight={nextAction(b, "owner")}/>)}</div>
  </div>;
}
