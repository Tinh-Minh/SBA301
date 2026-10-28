import { SummaryCard } from "@/components/SummaryCard.jsx";
import { useMemo, useState } from "react";
import { FilterBar, OwnerCrumb, OwnerHeading, OwnerState } from "@/components/owner/OwnerScreen.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useApiMutation } from "@/hooks/useApiMutation.js";
import { ownerRoutes } from "@/routes/paths.js";
import { orderService } from "@/hooks/useBookings.js";
import { RequestCard, filters } from "@/components/bookings/components/RequestCard.jsx";

export default function OwnerRequests() {
    const resource = useApiQuery(["owner", "bookings"], () => orderService.listMine());
    const approve = useApiMutation(orderService.approve, resource.reload);
    const reject = useApiMutation((id, reason) => orderService.reject(id, reason), resource.reload);
    const [filter, setFilter] = useState("PENDING");
    const [query, setQuery] = useState("");
    const [rejectingId, setRejectingId] = useState(null);
    const [reason, setReason] = useState("");
    const rows = resource.data ?? [];
    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return rows
            .filter(item => filter === "all" || item.order.status === filter)
            .filter(item => !keyword || `${item.order.orderCode} ${item.car.brand} ${item.car.model} ${item.renter.fullName}`.toLowerCase().includes(keyword))
            .sort((a, b) => Date.parse(a.order.expiresAt ?? a.order.startTime) - Date.parse(b.order.expiresAt ?? b.order.startTime));
    }, [rows, filter, query]);
    const pending = rows.filter(item => item.order.status === "PENDING").length;
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Yêu cầu đặt xe" parent={{ href: ownerRoutes.dashboard, label: "Bảng điều khiển" }}/>
      <OwnerHeading title="Yêu cầu đặt xe" description="Xem hồ sơ khách, thời hạn phản hồi 2 giờ và chấp nhận hoặc từ chối yêu cầu giữ chỗ."/>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard label="Chờ xử lý" value={`${pending} đơn`} hint="Cần phản hồi trước khi hết hạn"/>
      <SummaryCard label="Đã duyệt" value={`${rows.filter(item => item.order.status === "CONFIRMED" || item.order.status === "ONGOING" || item.order.status === "COMPLETED").length}`} hint="Đơn chủ xe đã nhận"/>
      <SummaryCard label="Không nhận" value={`${rows.filter(item => item.order.status === "REJECTED" || item.order.status === "EXPIRED").length}`} hint="Từ chối hoặc quá hạn"/>
    </div>
    <OwnerState loading={resource.loading && !resource.data} error={resource.error} label="yêu cầu"/>
    {resource.data ? <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar value={filter} onChange={setFilter} options={filters.map(item => ({ ...item, label: item.id === "all" ? `${item.label} (${rows.length})` : item.label }))}/>
        <label className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2 text-sm">
          <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-muted-gray">Tìm</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Mã đơn, xe, khách" className="w-48 bg-transparent text-charcoal outline-none placeholder:text-muted-gray"/>
        </label>
      </div>
      {visible.length === 0 ? <div className="rounded-2xl border border-card-border bg-white p-10 text-center text-sm text-muted-gray">Không có yêu cầu trong bộ lọc này.</div> : null}
      <div className="flex flex-col gap-4">
        {visible.map(item => <RequestCard key={item.order.id} item={item} rejecting={rejectingId === item.order.id} reason={reason} busy={approve.running || reject.running} error={approve.error ?? reject.error} onReason={setReason} onStartReject={() => { setRejectingId(item.order.id); setReason(""); }} onCancelReject={() => setRejectingId(null)} onApprove={() => void approve.run(item.order.id)} onReject={() => { if (!reason.trim())
                return; void reject.run(item.order.id, reason.trim()).then(() => setRejectingId(null)); }}/>)}
      </div>
    </> : null}
  </div>;
}
