import { useState } from "react";
import { Link } from "react-router";
import { AdminPageHeader, AdminState } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { request } from "@/services/api.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";

const settlementService = {
    list: ({ type, status }) => request("/api/admin/settlements", { query: { type: type || undefined, status: status || undefined } }),
    complete: (id, referenceCode, note) => request(`/api/admin/settlements/${id}/complete`, { method: "POST", json: { referenceCode, note } }),
};

const TYPES = [["", "Tất cả loại"], ["CUSTOMER_REFUND", "Hoàn tiền cho khách"], ["OWNER_PAYOUT", "Chi trả cho chủ xe"], ["OWNER_PENALTY", "Phạt chủ xe"]];
const STATUSES = [["PENDING", "Đang chờ xử lý"], ["COMPLETED", "Đã xử lý"], ["", "Tất cả"]];

/** Admin xử lý phiếu hoàn tiền / chi trả: chuyển khoản theo thông tin trên phiếu rồi nhập mã giao dịch. */
export default function AdminSettlementsPage() {
    const [type, setType] = useState("");
    const [status, setStatus] = useState("PENDING");
    const list = useApiQuery(["admin", "settlements", type, status], () => settlementService.list({ type, status }));
    const [refs, setRefs] = useState({});
    const [error, setError] = useState("");
    const rows = list.data ?? [];
    const overdue = rows.filter(r => r.overdue).length;

    async function complete(id) {
        setError("");
        try { await settlementService.complete(id, refs[id] ?? ""); await list.reload(); }
        catch (e) { setError(e.message); }
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A11" title="Phiếu hoàn tiền & chi trả" description="Hoàn cọc cho khách, chi trả tiền thuê cho chủ xe và phiếu phạt chủ xe. Thời hạn xử lý: 3 ngày làm việc kể từ khi tạo phiếu."/>
    <div className="flex flex-wrap gap-2">
      <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm">{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      {overdue ? <span className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#B91C1C]">{overdue} phiếu quá hạn xử lý</span> : null}
    </div>
    {error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{error}</p> : null}
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="phiếu" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">{rows.map(s => <article key={s.id} className={`rounded-2xl border bg-white p-4 text-sm shadow-sm ${s.overdue ? "border-[#FCA5A5]" : "border-[#E9E9E7]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold">{s.typeLabel} • <span className="text-[#FC6C26]">{formatMoney(s.amount)}</span></p>
          <p className="font-mono text-xs text-[#666666]">{s.slipCode} • Đơn {s.bookingId ? <Link to={`/trips/${s.bookingId}`} className="font-bold text-[#FC6C26]">{s.bookingCode}</Link> : "—"}</p>
          <p className="mt-1 text-xs text-[#444444]">{s.reason}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${s.status === "COMPLETED" ? "bg-[#ECFDF5] text-[#047857]" : s.overdue ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#FFF7ED] text-[#9A3412]"}`}>
          {s.status === "COMPLETED" ? "Đã xử lý" : s.overdue ? "Quá hạn" : `Hạn ${formatDateTime(s.dueAt)}`}
        </span>
      </div>
      <dl className="mt-3 grid gap-1 rounded-xl bg-[#F7F7F5] p-3 text-xs sm:grid-cols-2">
        <div><dt className="inline text-[#666666]">Người nhận: </dt><dd className="inline font-semibold">{s.recipientName}</dd></div>
        <div><dt className="inline text-[#666666]">Chủ tài khoản: </dt><dd className="inline font-semibold">{s.bankAccountHolder ?? "—"}</dd></div>
        <div><dt className="inline text-[#666666]">Số tài khoản: </dt><dd className="inline font-mono font-semibold">{s.bankAccountNumber ?? "Chưa khai báo"}</dd></div>
        <div><dt className="inline text-[#666666]">Ngân hàng: </dt><dd className="inline font-semibold">{s.bankName ?? "—"}</dd></div>
        <div className="sm:col-span-2"><dt className="inline text-[#666666]">Chi nhánh / PGD: </dt><dd className="inline font-semibold">{s.bankBranch ?? "—"}</dd></div>
      </dl>
      {s.status === "COMPLETED" ? <p className="mt-2 text-xs text-[#047857]">Chuyển lúc {formatDateTime(s.processedAt)} • Mã giao dịch {s.referenceCode}{s.note ? ` • ${s.note}` : ""}</p>
        : s.slipType === "OWNER_PENALTY" ? <p className="mt-2 text-xs text-[#666666]">Phiếu phạt tự cấn trừ vào lần chi trả kế tiếp của chủ xe.</p>
        : <div className="mt-3 flex flex-wrap gap-2">
          <input value={refs[s.id] ?? ""} onChange={e => setRefs(prev => ({ ...prev, [s.id]: e.target.value }))} placeholder="Mã giao dịch chuyển khoản" className="min-w-48 flex-1 rounded-xl border border-[#E9E9E7] px-3 py-2"/>
          <button type="button" disabled={!refs[s.id]?.trim() || s.bankMissing} onClick={() => complete(s.id)} className="rounded-xl bg-[#FC6C26] px-4 py-2 font-bold text-white disabled:opacity-50">Xác nhận đã chuyển</button>
        </div>}
    </article>)}</div>
  </div>;
}
