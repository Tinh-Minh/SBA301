import { useState } from "react";
import { Link } from "react-router";
import { AdminPageHeader, AdminState, Pager, adminInput } from "@/components/admin/AdminUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { StatCard } from "@/components/booking/Stats.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { bookingStatusMeta, durationLabel } from "@/utils/rental.js";

/** Admin: toàn bộ đơn thuê, lọc theo trạng thái / mã / tên / biển số, xem biên bản và huỷ khi cần. */
export default function AdminBookingsPage() {
    const [status, setStatus] = useState("");
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const stats = useApiQuery(["admin", "bookings", "stats"], tripService.adminStats);
    const list = useApiQuery(["admin", "bookings", status, search, page], () => tripService.adminList({ status: status || undefined, q: search || undefined, page, size: 20 }));
    const rows = list.data?.content ?? [];
    const s = stats.data;
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A09" title="Đơn thuê xe" description="Theo dõi mọi đơn thuê, biên bản bàn giao và tranh chấp hiện trạng giữa khách và chủ xe."/>
    {s ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Tổng đơn" value={s.total} hint={`${s.requested} chờ chủ xe • ${s.confirmed} đã xác nhận`}/>
      <StatCard label="Đang thuê / bàn giao" value={s.inProgress} tone="brand"/>
      <StatCard label="Biên bản bị khách yêu cầu sửa" value={s.disputedHandovers} tone={s.disputedHandovers ? "warn" : "default"} hint="Cần theo dõi nếu kéo dài"/>
      <StatCard label="Giá trị chuyến hoàn tất" value={formatMoney(s.completedValue)} tone="good" hint={`${s.completed} hoàn tất • ${s.cancelled} huỷ/từ chối/hết hạn`}/>
    </div> : null}
    <form onSubmit={e => { e.preventDefault(); setPage(0); setSearch(q.trim()); }} className="flex flex-wrap gap-2">
      <select value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} className={adminInput.replace("w-full", "w-56")}><option value="">Tất cả trạng thái</option>{Object.entries(bookingStatusMeta).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="Mã đơn, tên khách/chủ xe, biển số" className={adminInput.replace("w-full", "w-72 max-w-full")}/>
      <button type="submit" className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Lọc</button>
    </form>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && !rows.length} label="đơn thuê" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="text-xs uppercase text-[#666666]"><tr><th className="p-3">Mã đơn</th><th>Xe</th><th>Khách / Chủ xe</th><th>Thời gian</th><th>Giá trị</th><th>Trạng thái</th><th/></tr></thead>
        <tbody>{rows.map(b => <tr key={b.id} className="border-t border-[#E9E9E7] align-top">
          <td className="p-3 font-mono text-xs">{b.bookingCode}</td>
          <td className="py-3">{b.carName}<span className="block font-mono text-xs text-[#666666]">{b.carLicensePlate}</span></td>
          <td className="py-3">{b.customerName}<span className="block text-xs text-[#666666]">Chủ xe: {b.ownerName}</span></td>
          <td className="py-3 text-xs">{formatDateTime(b.pickupAt)}<br/>→ {formatDateTime(b.returnAt)}<br/><b>{durationLabel(b.rentalDays, b.rentalHours)}</b></td>
          <td className="py-3 font-semibold">{formatMoney(b.finalAmount ?? b.rentalAmount)}</td>
          <td className="py-3"><StatusBadge meta={bookingStatusMeta[b.status]}/>{b.handovers.some(h => h.status === "DISPUTED") ? <span className="mt-1 block text-xs font-bold text-[#B91C1C]">Biên bản đang tranh chấp</span> : null}</td>
          <td className="py-3 pr-3 text-right"><Link to={`/trips/${b.id}`} className="font-bold text-[#FC6C26]">Xem</Link></td>
        </tr>)}</tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
  </div>;
}
