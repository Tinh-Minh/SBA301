import { useMemo, useState } from "react";
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

const TYPES = [
    ["", "Tất cả loại dòng tiền"],
    ["OWNER_PAYOUT", "Chuyển tiền cho Chủ xe"],
    ["CUSTOMER_REFUND", "Hoàn tiền cho Khách hàng"],
    ["OWNER_PENALTY", "Phạt chủ xe"],
];
const STATUSES = [
    ["PENDING", "⏳ Chờ kiểm tra & chuyển (Chưa chuyển)"],
    ["COMPLETED", "✓ Đã chuyển thành công"],
    ["", "Tất cả trạng thái"],
];

/** Admin nhận tiền khách hàng chuyển qua nền tảng, kiểm tra và tích phê duyệt chuyển về cho Chủ xe (đồng bộ trực tiếp sang Chủ xe). */
export default function AdminSettlementsPage() {
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const list = useApiQuery(["admin", "settlements", type, status], () => settlementService.list({ type, status }));
    const [refs, setRefs] = useState({});
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");
    const rows = list.data ?? [];
    const overdue = rows.filter(r => r.overdue).length;

    const pendingOwnerTotal = useMemo(
        () => rows.filter(r => r.slipType === "OWNER_PAYOUT" && r.status === "PENDING").reduce((sum, r) => sum + Number(r.amount || 0), 0),
        [rows]
    );
    const completedOwnerTotal = useMemo(
        () => rows.filter(r => r.slipType === "OWNER_PAYOUT" && r.status === "COMPLETED").reduce((sum, r) => sum + Number(r.amount || 0), 0),
        [rows]
    );
    const pendingOwnerCount = useMemo(
        () => rows.filter(r => r.slipType === "OWNER_PAYOUT" && r.status === "PENDING").length,
        [rows]
    );

    async function complete(id) {
        setError("");
        setBusyId(id);
        try {
            await settlementService.complete(id, refs[id] ?? "", "Admin đã kiểm tra và xác nhận chuyển tiền cho chủ xe");
            await list.reload();
        } catch (e) {
            setError(e.message);
        } finally {
            setBusyId(null);
        }
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader
      code="A11"
      title="Kiểm soát dòng tiền & Phê duyệt chi trả Chủ xe"
      description="Nhận các khoản tiền đặt cọc và tiền thuê xe do khách hàng thanh toán qua nền tảng, kiểm tra và tích xác nhận đã chuyển về cho Chủ xe (tự động đồng bộ trạng thái sang kênh Chủ xe)."
    />

    <div className="grid gap-4 sm:grid-cols-3">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Chờ chuyển cho Chủ xe (Nền tảng đang giữ)</span>
        <p className="mt-1 text-2xl font-extrabold text-amber-950">{formatMoney(pendingOwnerTotal)}</p>
        <p className="mt-1 text-xs text-amber-800">{pendingOwnerCount} khoản khách đã đóng chờ Admin duyệt chuyển</p>
      </div>
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Đã chuyển về Chủ xe</span>
        <p className="mt-1 text-2xl font-extrabold text-emerald-950">{formatMoney(completedOwnerTotal)}</p>
        <p className="mt-1 text-xs text-emerald-800">Đã đồng bộ trạng thái đã nhận tiền cho Chủ xe</p>
      </div>
      <div className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">Tổng số phiếu đối soát</span>
        <p className="mt-1 text-2xl font-extrabold text-[#292929]">{rows.length} phiếu</p>
        <p className="mt-1 text-xs text-[#666666]">{overdue ? `${overdue} phiếu quá hạn xử lý` : "Đang hiển thị theo bộ lọc hiện tại"}</p>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      <select value={type} onChange={e => setType(e.target.value)} className="rounded-xl border border-[#E9E9E7] bg-white px-3 py-2 text-sm font-semibold">{TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <select value={status} onChange={e => setStatus(e.target.value)} className="rounded-xl border border-[#E9E9E7] bg-white px-3 py-2 text-sm font-semibold">{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      {overdue ? <span className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#B91C1C]">{overdue} phiếu quá hạn xử lý</span> : null}
    </div>
    {error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{error}</p> : null}
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && rows.length === 0} label="phiếu dòng tiền" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">{rows.map(s => <article key={s.id} className={`rounded-2xl border bg-white p-5 text-sm shadow-sm ${s.status === "COMPLETED" ? "border-emerald-200" : s.overdue ? "border-[#FCA5A5]" : "border-[#E9E9E7]"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-base font-extrabold text-[#25251F]">{s.typeLabel} • <span className="text-[#FC6C26]">{formatMoney(s.amount)}</span></p>
          <p className="mt-0.5 font-mono text-xs text-[#666666]">
            {s.slipCode} • Đơn {s.bookingId ? <Link to={`/trips/${s.bookingId}`} className="font-bold text-[#FC6C26] underline">{s.bookingCode}</Link> : "—"}
            {s.carName ? ` • Xe: ${s.carName}` : ""}
            {s.customerName ? ` • Khách chuyển: ${s.customerName}` : ""}
          </p>
          <p className="mt-1.5 text-xs text-[#444444]">{s.reason}</p>
        </div>
        <span className={`rounded-full px-3.5 py-1.5 text-xs font-bold ${s.status === "COMPLETED" ? "bg-[#ECFDF5] text-[#047857] border border-emerald-300" : s.overdue ? "bg-[#FEF2F2] text-[#B91C1C]" : "bg-[#FFF7ED] text-[#9A3412] border border-amber-300"}`}>
          {s.status === "COMPLETED" ? "✓ Đã chuyển cho Chủ xe / Người nhận" : s.overdue ? "Quá hạn xử lý" : `⏳ Chờ chuyển (Hạn ${formatDateTime(s.dueAt)})`}
        </span>
      </div>
      <dl className="mt-3 grid gap-1.5 rounded-xl bg-[#F7F7F5] p-3.5 text-xs sm:grid-cols-3">
        <div><dt className="inline text-[#666666]">Chủ xe / Người nhận: </dt><dd className="inline font-bold text-[#25251F]">{s.recipientName}</dd></div>
        <div><dt className="inline text-[#666666]">Khách đã đóng nền tảng: </dt><dd className="inline font-bold text-[#FC6C26]">{s.customerPaidAmount != null ? formatMoney(s.customerPaidAmount) : formatMoney(s.amount)}</dd></div>
        <div><dt className="inline text-[#666666]">Chủ tài khoản NH: </dt><dd className="inline font-semibold">{s.bankAccountHolder ?? "—"}</dd></div>
        <div><dt className="inline text-[#666666]">Số tài khoản NH: </dt><dd className="inline font-mono font-semibold">{s.bankAccountNumber ?? "Chưa khai báo"}</dd></div>
        <div><dt className="inline text-[#666666]">Ngân hàng: </dt><dd className="inline font-semibold">{s.bankName ?? "—"}</dd></div>
        <div><dt className="inline text-[#666666]">Chi nhánh / PGD: </dt><dd className="inline font-semibold">{s.bankBranch ?? "—"}</dd></div>
      </dl>
      {s.status === "COMPLETED" ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-[#047857]">
          <span>✓ Đã tích chuyển tiền thành công (Đã đồng bộ sang tài khoản Chủ xe)</span>
          <span>Lúc {formatDateTime(s.processedAt)} • Mã GD: <strong className="font-mono">{s.referenceCode}</strong>{s.note ? ` • ${s.note}` : ""}</span>
        </div>
      ) : s.slipType === "OWNER_PENALTY" ? (
        <p className="mt-2 text-xs text-[#666666]">Phiếu phạt tự cấn trừ vào lần chi trả kế tiếp của chủ xe.</p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
          <input
            value={refs[s.id] ?? ""}
            onChange={e => setRefs(prev => ({ ...prev, [s.id]: e.target.value }))}
            placeholder="Mã giao dịch chuyển khoản (không bắt buộc — tự sinh nếu để trống)"
            className="min-w-56 flex-1 rounded-xl border border-[#E4E2D8] bg-white px-3 py-2 text-xs"
          />
          <button
            type="button"
            disabled={busyId === s.id}
            onClick={() => void complete(s.id)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#047857] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#065f46] disabled:opacity-50"
          >
            <input type="checkbox" checked={false} readOnly className="pointer-events-none size-4 accent-white" />
            {busyId === s.id ? "Đang đồng bộ…" : s.slipType === "OWNER_PAYOUT" ? "Tích xác nhận đã chuyển cho Chủ xe" : "Tích xác nhận đã hoàn tiền"}
          </button>
        </div>
      )}
    </article>)}</div>
  </div>;
}
