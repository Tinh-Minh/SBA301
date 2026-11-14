import { useState } from "react";
import { useNavigate } from "react-router";
import { AdminPageHeader, AdminState, Pager, adminInput } from "@/components/admin/AdminUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { formatMoney } from "@/utils/labels.js";
import { bookingStatusMeta, durationLabel } from "@/utils/rental.js";

// Tab trạng thái: mỗi tab là một trạng thái của đơn; số đếm lấy từ thống kê nếu có.
const TABS = [
    { key: "", label: "Tất cả", count: s => s.total },
    { key: "REQUESTED", label: "Chờ xác nhận", count: s => s.requested },
    { key: "CONFIRMED", label: "Đã xác nhận", count: s => s.confirmed },
    { key: "IN_PROGRESS", label: "Đang thuê", count: s => s.inProgress },
    { key: "COMPLETED", label: "Hoàn tất", count: s => s.completed },
    { key: "CANCELLED", label: "Đã huỷ" },
    { key: "REJECTED", label: "Bị từ chối" },
    { key: "EXPIRED", label: "Quá hạn" },
];

function parse(value) { return value ? new Date(value) : null; }
const two = n => String(n).padStart(2, "0");
function shortStamp(d) { return `${two(d.getDate())}/${two(d.getMonth() + 1)} ${two(d.getHours())}:${two(d.getMinutes())}`; }
/** "16/12 09:00 – 17/12 09:00"; nếu cùng ngày chỉ ghi giờ ở vế sau. */
function rangeLabel(from, to) {
    const a = parse(from), b = parse(to);
    if (!a || !b) return "—";
    const sameDay = a.toDateString() === b.toDateString();
    return `${shortStamp(a)} – ${sameDay ? `${two(b.getHours())}:${two(b.getMinutes())}` : shortStamp(b)}`;
}

/** Admin: toàn bộ đơn thuê, lọc theo trạng thái / mã / tên / biển số; bấm vào dòng để mở chi tiết đơn. */
export default function AdminBookingsPage() {
    const navigate = useNavigate();
    const [status, setStatus] = useState("");
    const [q, setQ] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const stats = useApiQuery(["admin", "bookings", "stats"], tripService.adminStats);
    const list = useApiQuery(["admin", "bookings", status, search, page], () => tripService.adminList({ status: status || undefined, q: search || undefined, page, size: 20 }));
    const rows = list.data?.content ?? [];
    const s = stats.data;
    const open = id => navigate(`/trips/${id}`);

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A09" title="Đơn thuê xe" description="Theo dõi mọi đơn thuê, biên bản bàn giao và tranh chấp hiện trạng giữa khách và chủ xe."/>

    {s ? <dl className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white sm:grid-cols-4">
      {[["Tổng đơn", s.total], ["Đang thuê / bàn giao", s.inProgress], ["Biên bản tranh chấp", s.disputedHandovers], ["Giá trị hoàn tất", formatMoney(s.completedValue)]].map(([label, value], i) =>
        <div key={label} className={`px-4 py-3 ${i ? "sm:border-l" : ""} border-[#EFEDE8]`}>
          <dt className="text-xs text-[#8A887F]">{label}</dt>
          <dd className={`mt-0.5 text-lg font-bold tabular-nums ${label === "Biên bản tranh chấp" && value ? "text-[#B91C1C]" : ""}`}>{value}</dd>
        </div>)}
    </dl> : null}

    <div className="flex flex-col gap-3 border-b border-[#E7E5DF]">
      <form onSubmit={e => { e.preventDefault(); setPage(0); setSearch(q.trim()); }} className="flex justify-end">
        <input type="search" value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm mã đơn, tên, biển số… (Enter)" aria-label="Tìm đơn thuê" className={adminInput.replace("w-full", "w-72 max-w-full")}/>
      </form>
      <nav aria-label="Lọc theo trạng thái" className="-mb-px flex gap-1 overflow-x-auto">
        {TABS.map(tab => {
            const active = status === tab.key;
            const count = s && tab.count ? tab.count(s) : null;
            return <button key={tab.key || "all"} type="button" role="tab" aria-selected={active}
              onClick={() => { setStatus(tab.key); setPage(0); }}
              className={`whitespace-nowrap border-b-2 px-3 pb-2.5 pt-1 text-sm transition-colors ${active ? "border-[#1F1F1D] font-bold text-[#1F1F1D]" : "border-transparent font-medium text-[#8A887F] hover:border-[#D6D3CB] hover:text-[#1F1F1D]"}`}>
              {tab.label}{count != null ? <span className={`ml-1.5 rounded-md px-1.5 py-0.5 text-[11px] tabular-nums ${active ? "bg-[#1F1F1D] text-white" : "bg-[#EFEDE7] text-[#57564F]"}`}>{count}</span> : null}
            </button>;
        })}
      </nav>

    </div>

    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && !rows.length} label="đơn thuê" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white">
      <table className="w-full min-w-[900px] table-fixed text-left text-sm">
        <colgroup><col className="w-[17%]"/><col className="w-[19%]"/><col className="w-[16%]"/><col className="w-[21%]"/><col className="w-[12%]"/><col className="w-[15%]"/></colgroup>
        <thead><tr className="whitespace-nowrap"><th className="px-4 py-2.5">Mã đơn</th><th className="px-3 py-2.5">Xe</th><th className="px-3 py-2.5">Khách · Chủ xe</th><th className="px-3 py-2.5">Thời gian</th><th className="px-3 py-2.5 text-right">Giá trị</th><th className="px-4 py-2.5">Trạng thái</th></tr></thead>
        <tbody>{rows.map(b => {
            const disputed = b.handovers.some(h => h.status === "DISPUTED");
            return <tr key={b.id} tabIndex={0} onClick={() => open(b.id)} onKeyDown={e => { if (e.key === "Enter") open(b.id); }}
              className="cursor-pointer border-t border-[#EFEDE8] focus-visible:bg-[#FAF8F4]" aria-label={`Mở đơn ${b.bookingCode}`}>
              <td className="px-4 py-3 align-middle whitespace-nowrap font-mono text-[11px] text-[#8A887F]">{b.bookingCode}</td>
              <td className="px-3 py-3 align-middle"><span className="block truncate font-semibold">{b.carName}</span><span className="block font-mono text-xs text-[#8A887F]">{b.carLicensePlate}</span></td>
              <td className="px-3 py-3 align-middle"><span className="block truncate">{b.customerName}</span><span className="block truncate text-xs text-[#8A887F]">{b.ownerName}</span></td>
              <td className="px-3 py-3 align-middle"><span className="block whitespace-nowrap tabular-nums">{rangeLabel(b.pickupAt, b.returnAt)}</span><span className="block text-xs text-[#8A887F]">{durationLabel(b.rentalDays, b.rentalHours)}</span></td>
              <td className="px-3 py-3 text-right align-middle font-semibold whitespace-nowrap tabular-nums">{formatMoney(b.finalAmount ?? b.rentalAmount)}</td>
              <td className="px-4 py-3 align-middle"><StatusBadge meta={bookingStatusMeta[b.status]}/>{disputed ? <span className="mt-1 block text-xs font-semibold text-[#B91C1C]">Biên bản tranh chấp</span> : null}</td>
            </tr>;
        })}</tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
  </div>;
}
