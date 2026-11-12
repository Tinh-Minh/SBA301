import { useState } from "react";
import { fieldClass } from "@/components/LiveUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { PhotoInput } from "@/components/booking/PhotoInput.jsx";
import { SafetyBadge, recordTypeLabels, useSafety } from "@/components/booking/SafetyPanel.jsx";
import { safetyService } from "@/services/tripService.js";
import { formatDate } from "@/utils/datetime.js";

const verifyMeta = { PENDING: { label: "Chờ CarDB xác minh", tone: "warning" }, APPROVED: { label: "Đã xác minh", tone: "success" }, REJECTED: { label: "Bị từ chối", tone: "danger" } };
const blank = { recordType: "INSPECTION", performedAt: "", expiresAt: "", provider: "", referenceNumber: "", odometerKm: "", result: "PASSED", note: "", fileUrl: "" };

/** Chủ xe khai báo lịch sử đăng kiểm, bảo hiểm, bảo dưỡng, sửa chữa cho một xe. */
export function SafetyManager({ carId }) {
    const safety = useSafety(carId);
    const [form, setForm] = useState(blank);
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
    const needsExpiry = form.recordType === "INSPECTION" || form.recordType === "INSURANCE";

    async function save() {
        setBusy(true); setError("");
        try {
            await safetyService.create(carId, { ...form, expiresAt: form.expiresAt || null, odometerKm: form.odometerKm ? Number(form.odometerKm) : null,
                result: form.recordType === "INSPECTION" ? form.result : "NOT_APPLICABLE", fileUrl: form.fileUrl || null });
            setForm(blank); setOpen(false); await safety.reload();
        } catch (e) { setError(e.message); } finally { setBusy(false); }
    }
    async function remove(id) {
        setError("");
        try { await safetyService.remove(carId, id); await safety.reload(); } catch (e) { setError(e.message); }
    }

    const d = safety.data;
    return <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div><h2 className="font-bold text-charcoal">Hồ sơ an toàn</h2>{d ? <p className="text-xs text-muted-gray">{d.headline}</p> : null}</div>
      <div className="flex items-center gap-2">{d ? <SafetyBadge level={d.level}/> : null}<button type="button" onClick={() => setOpen(v => !v)} className="rounded-xl bg-brand-accent px-3 py-1.5 text-xs font-bold text-white">{open ? "Đóng" : "+ Thêm bản ghi"}</button></div>
    </div>
    {open ? <div className="mt-4 grid gap-3 rounded-xl bg-bg-light p-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-xs font-semibold text-muted-gray">Loại<select value={form.recordType} onChange={set("recordType")} className={`${fieldClass} mt-1`}>{Object.entries(recordTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
      <label className="text-xs font-semibold text-muted-gray">Ngày thực hiện *<input type="date" value={form.performedAt} onChange={set("performedAt")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-muted-gray">{needsExpiry ? "Hiệu lực đến *" : "Hẹn lần tới"}<input type="date" value={form.expiresAt} onChange={set("expiresAt")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-muted-gray">Đơn vị (trung tâm / hãng / gara)<input value={form.provider} onChange={set("provider")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-muted-gray">Số tem / hợp đồng / phiếu<input value={form.referenceNumber} onChange={set("referenceNumber")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-muted-gray">Số km lúc đó<input type="number" min="0" value={form.odometerKm} onChange={set("odometerKm")} className={`${fieldClass} mt-1`}/></label>
      {form.recordType === "INSPECTION" ? <label className="text-xs font-semibold text-muted-gray">Kết quả<select value={form.result} onChange={set("result")} className={`${fieldClass} mt-1`}><option value="PASSED">Đạt</option><option value="FAILED">Không đạt</option></select></label> : null}
      <label className="text-xs font-semibold text-muted-gray sm:col-span-2">Ghi chú<input value={form.note} onChange={set("note")} className={`${fieldClass} mt-1`}/></label>
      <div className="sm:col-span-2 lg:col-span-3"><p className="mb-1 text-xs font-semibold text-muted-gray">Ảnh chứng từ</p><PhotoInput value={form.fileUrl} onChange={url => setForm(f => ({ ...f, fileUrl: url }))} label="Tải ảnh chứng từ"/></div>
      <button type="button" disabled={busy || !form.performedAt || (needsExpiry && !form.expiresAt)} onClick={save} className="self-start rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang lưu…" : "Lưu bản ghi"}</button>
    </div> : null}
    {error ? <p role="alert" className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}
    {d?.records.length ? <table className="mt-4 w-full text-left text-sm">
      <thead className="text-xs uppercase text-muted-gray"><tr><th className="py-2">Ngày</th><th>Loại</th><th className="hidden sm:table-cell">Chi tiết</th><th>Xác minh</th><th/></tr></thead>
      <tbody>{d.records.map(r => <tr key={r.id} className="border-t border-card-border align-top">
        <td className="py-2 whitespace-nowrap">{formatDate(r.performedAt)}</td>
        <td>{recordTypeLabels[r.recordType]}{r.result === "FAILED" ? <span className="block text-xs font-bold text-[#B91C1C]">Không đạt</span> : null}</td>
        <td className="hidden text-xs text-muted-gray sm:table-cell">{[r.provider, r.referenceNumber, r.odometerKm ? `${r.odometerKm} km` : null, r.expiresAt ? `đến ${formatDate(r.expiresAt)}` : null].filter(Boolean).join(" • ")}{r.rejectReason ? <span className="block text-[#B91C1C]">Lý do từ chối: {r.rejectReason}</span> : null}</td>
        <td><StatusBadge meta={verifyMeta[r.verifyStatus]}/></td>
        <td className="text-right">{r.verifyStatus !== "APPROVED" ? <button type="button" onClick={() => remove(r.id)} className="text-xs font-bold text-[#B91C1C]">Xoá</button> : null}</td>
      </tr>)}</tbody>
    </table> : <p className="mt-3 text-sm text-muted-gray">Chưa có bản ghi. Khai báo đăng kiểm và bảo hiểm để khách yên tâm thuê xe.</p>}
  </section>;
}
