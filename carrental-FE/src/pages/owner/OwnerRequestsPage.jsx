import { useMemo, useState } from "react";
import { Icon } from "@/shared/components/Icon.jsx";
import { CountdownBadge } from "@/shared/components/owner/CountdownBadge.jsx";
import { FilterBar, OwnerCrumb, OwnerHeading, OwnerState, PayoutMath } from "@/shared/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/shared/components/owner/StatusBadge.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { formatRentalPeriod, canRespondToOrder, kycStatusMeta, orderStatusMeta } from "@/shared/utils/owner.js";
import { ownerRoutes } from "@/app/routes/owner.routes.js";

import { orderService } from "@/services/order.service";
const filters = [
    { id: "all", label: "Tất cả" },
    { id: "PENDING", label: "Chờ xác nhận" },
    { id: "CONFIRMED", label: "Đã duyệt" },
    { id: "REJECTED", label: "Từ chối" },
    { id: "EXPIRED", label: "Hết hạn" },
];
function initials(name) {
    return name.split(" ").slice(-2).map(part => part[0] ?? "").join("").toUpperCase();
}
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
      <OwnerCrumb current="Yêu cầu đặt xe" parent={{ href: ownerRoutes.dashboard, label: "Bảng điều khiển" }}/>
      <OwnerHeading title="Yêu cầu đặt xe" description="Xem hồ sơ khách, thời hạn phản hồi 2 giờ và chấp nhận hoặc từ chối yêu cầu giữ chỗ."/>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <Summary label="Chờ xử lý" value={`${pending} đơn`} hint="Cần phản hồi trước khi hết hạn"/>
      <Summary label="Đã duyệt" value={`${rows.filter(item => item.order.status === "CONFIRMED" || item.order.status === "ONGOING" || item.order.status === "COMPLETED").length}`} hint="Đơn chủ xe đã nhận"/>
      <Summary label="Không nhận" value={`${rows.filter(item => item.order.status === "REJECTED" || item.order.status === "EXPIRED").length}`} hint="Từ chối hoặc quá hạn"/>
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
function Summary({ label, value, hint }) {
    return <div className="rounded-2xl border border-card-border bg-white p-4 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">{label}</p>
    <p className="mt-1 text-2xl font-bold text-charcoal">{value}</p>
    <p className="text-xs text-muted-gray">{hint}</p>
  </div>;
}
function RequestCard({ item, rejecting, reason, busy, error, onReason, onStartReject, onCancelReject, onApprove, onReject }) {
    const { order, car, renter } = item;
    const period = formatRentalPeriod(order);
    const open = canRespondToOrder(order);
    const kyc = kycStatusMeta[renter.kycStatus];
    return <article className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-mono text-xs font-bold text-brand-accent">{order.orderCode} • {car.licensePlate}</p>
      <div className="flex items-center gap-2">
        {order.status === "PENDING" ? <CountdownBadge deadline={order.expiresAt}/> : <StatusBadge meta={orderStatusMeta[order.status]}/>}
      </div>
    </div>
    <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold text-charcoal">{car.brand} {car.model}</h2>
          <p className="text-sm text-muted-gray">{period.range}</p>
          <p className="text-xs text-muted-gray">{period.duration}</p>
        </div>
        <p className="text-sm text-muted-gray">{car.pickupAddress}</p>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-bg-light text-xs font-bold text-charcoal">{initials(renter.fullName)}</span>
          <div>
            <p className="font-semibold text-charcoal">{renter.fullName}</p>
            <p className="text-xs text-status-success-ink">{kyc.label} • {renter.phone}</p>
          </div>
        </div>
        {order.paymentStatus === "PAID" ? <p className="text-xs font-semibold text-status-success-ink">Khách đã thanh toán tiền thuê vào escrow.</p> : <p className="text-xs text-muted-gray">Tiền thuê chưa vào escrow.</p>}
      </div>
      <PayoutMath order={order}/>
    </div>
    {open ? <div className="mt-4 flex flex-col gap-3 border-t border-card-border pt-4">
      {rejecting ? <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-charcoal">Lý do từ chối
          <textarea value={reason} onChange={event => onReason(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-card-border px-3 py-2 font-normal outline-none focus:border-brand-accent" placeholder="Xe bận lịch hoặc không đáp ứng yêu cầu giao xe"/>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onCancelReject} className="rounded-xl border border-card-border px-4 py-2 text-sm font-bold">Hủy</button>
          <button type="button" disabled={busy || !reason.trim()} onClick={onReject} className="rounded-xl bg-charcoal px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Xác nhận từ chối</button>
        </div>
      </div> : <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={busy} onClick={onStartReject} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-4 py-2 text-sm font-bold text-charcoal">
          <Icon name="close" className="text-[16px]"/> Từ chối
        </button>
        <button type="button" disabled={busy} onClick={onApprove} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
          <Icon name="check" className="text-[16px]"/> Chấp nhận đơn này
        </button>
      </div>}
      {error ? <p className="text-sm text-on-error-container">{error.message}</p> : null}
    </div> : null}
  </article>;
}
