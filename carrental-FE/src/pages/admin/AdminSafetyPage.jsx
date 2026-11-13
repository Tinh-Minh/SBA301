import { useState } from "react";
import { AdminPageHeader, AdminState, Pager, Tabs, adminInput } from "@/components/admin/AdminUi.jsx";
import { recordTypeLabels } from "@/components/booking/SafetyPanel.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { safetyService } from "@/services/tripService.js";
import { formatDate } from "@/utils/datetime.js";

const tabs = [{ id: "PENDING", label: "Chờ xác minh" }, { id: "APPROVED", label: "Đã xác minh" }, { id: "REJECTED", label: "Đã từ chối" }];

/** Admin xác minh hồ sơ đăng kiểm / bảo hiểm / bảo dưỡng / sửa chữa chủ xe khai báo. */
export default function AdminSafetyPage() {
    const [status, setStatus] = useState("PENDING");
    const [page, setPage] = useState(0);
    const [reasons, setReasons] = useState({});
    const [error, setError] = useState("");
    const list = useApiQuery(["admin", "safety", status, page], () => safetyService.adminList({ status, page, size: 20 }));
    const rows = list.data?.content ?? [];
    async function verify(r, verifyStatus) {
        setError("");
        try { await safetyService.verify(r.carId, r.id, { verifyStatus, rejectReason: reasons[r.id] || null }); await list.reload(); }
        catch (e) { setError(e.message); }
    }
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A10" title="Hồ sơ an toàn xe" description="Đối chiếu chứng từ đăng kiểm, bảo hiểm, bảo dưỡng, sửa chữa. Chỉ bản ghi đã xác minh mới làm xe được gắn nhãn “An toàn”."/>
    <Tabs items={tabs} value={status} onChange={v => { setStatus(v); setPage(0); }}/>
    {error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}
    <AdminState loading={list.loading && !list.data} error={list.error} empty={!!list.data && !rows.length} label="bản ghi" onRetry={list.reload}/>
    <div className="flex flex-col gap-3">{rows.map(r => <article key={r.id} className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 md:grid-cols-[120px_minmax(0,1fr)_260px]">
      {r.fileUrl ? <a href={r.fileUrl} target="_blank" rel="noreferrer"><img src={r.fileUrl} alt="Chứng từ" className="h-24 w-full rounded-lg object-cover"/></a> : <div className="flex h-24 items-center justify-center rounded-lg bg-[#F7F7F5] text-xs text-[#666666]">Không có ảnh</div>}
      <div className="text-sm">
        <p className="font-bold">{recordTypeLabels[r.recordType]} • {r.carName} <span className="font-mono text-xs text-[#666666]">{r.carLicensePlate}</span></p>
        <p className="text-xs text-[#666666]">Chủ xe: {r.ownerName}</p>
        <p className="mt-1">{formatDate(r.performedAt)}{r.expiresAt ? ` → ${formatDate(r.expiresAt)}` : ""} • {r.provider ?? "—"} • {r.referenceNumber ?? "không có số chứng từ"}{r.odometerKm ? ` • ${r.odometerKm} km` : ""}{r.result === "FAILED" ? " • KHÔNG ĐẠT" : ""}</p>
        {r.note ? <p className="text-xs text-[#666666]">{r.note}</p> : null}
        {r.rejectReason ? <p className="text-xs text-[#B91C1C]">Lý do từ chối: {r.rejectReason}</p> : null}
      </div>
      {r.verifyStatus === "PENDING" ? <div className="flex flex-col gap-2">
        <button type="button" onClick={() => verify(r, "APPROVED")} className="rounded-xl bg-[#047857] px-3 py-2 text-sm font-bold text-white">Xác minh hợp lệ</button>
        <input value={reasons[r.id] ?? ""} onChange={e => setReasons(c => ({ ...c, [r.id]: e.target.value }))} placeholder="Lý do từ chối" className={adminInput}/>
        <button type="button" disabled={!reasons[r.id]?.trim()} onClick={() => verify(r, "REJECTED")} className="rounded-xl border border-[#F3C5C5] px-3 py-2 text-sm font-bold text-[#B91C1C] disabled:opacity-40">Từ chối</button>
      </div> : null}
    </article>)}</div>
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
  </div>;
}
