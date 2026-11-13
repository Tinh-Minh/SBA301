import { useState } from "react";
import { Icon } from "@/components/Icon.jsx";
import { fieldClass } from "@/components/LiveUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { PhotoInput } from "@/components/booking/PhotoInput.jsx";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney } from "@/utils/labels.js";
import { handoverCategories } from "@/utils/rental.js";

const typeLabel = { PICKUP: "Biên bản nhận xe", RETURN: "Biên bản trả xe" };
const handoverMeta = {
    SUBMITTED: { label: "Chờ khách xác nhận", tone: "warning" },
    DISPUTED: { label: "Khách yêu cầu chỉnh sửa", tone: "danger" },
    CONFIRMED: { label: "Hai bên đã xác nhận", tone: "success" },
};
const itemMeta = {
    PENDING: { label: "Chờ xác nhận", tone: "neutral" },
    ACCEPTED: { label: "Đúng hiện trạng", tone: "success" },
    DISPUTED: { label: "Cần sửa", tone: "danger" },
    REVISED: { label: "Đã sửa, chờ xem lại", tone: "info" },
};

/** Chủ xe lập biên bản: số km, nhiên liệu và ảnh từng hạng mục. */
export function HandoverForm({ type, booking, busy, error, onSubmit }) {
    const [odometer, setOdometer] = useState(type === "RETURN" && booking.pickupOdometerKm ? String(booking.pickupOdometerKm) : "");
    const [fuel, setFuel] = useState("100");
    const [note, setNote] = useState("");
    const [fee, setFee] = useState("");
    const [feeNote, setFeeNote] = useState("");
    const [items, setItems] = useState({});
    const [localError, setLocalError] = useState("");
    const setItem = (id, patch) => setItems(current => ({ ...current, [id]: { ...current[id], ...patch } }));

    function submit() {
        const missing = handoverCategories.filter(c => c.required && !items[c.id]?.file && !items[c.id]?.photoUrl).map(c => c.label);
        if (!odometer) return setLocalError("Vui lòng nhập số km trên đồng hồ.");
        if (missing.length) return setLocalError(`Còn thiếu ảnh: ${missing.join(", ")}.`);
        if (Number(fee) > 0 && !feeNote.trim()) return setLocalError("Vui lòng ghi rõ lý do phí khác.");
        setLocalError("");
        const activeCategories = handoverCategories.filter(c => items[c.id]?.file || items[c.id]?.photoUrl);
        const data = {
            odometerKm: Number(odometer), fuelPercent: Number(fuel), ownerNote: note.trim() || null,
            otherFeeAmount: fee ? Number(fee) : null, otherFeeNote: feeNote.trim() || null,
            items: activeCategories.map(c => ({ category: c.id, conditionNote: items[c.id].note?.trim() || null })),
        };
        const photos = activeCategories.map(c => items[c.id].file);
        onSubmit({ data, photos });
    }

    return <section className="rounded-2xl border border-[#FDBA8C] bg-white p-5 shadow-sm">
    <h3 className="flex items-center gap-2 text-base font-bold text-[#292929]"><Icon name="assignment" className="text-[20px] text-[#FC6C26]"/>Lập {typeLabel[type].toLowerCase()}</h3>
    <p className="mt-1 text-sm text-[#666666]">Chụp rõ từng góc xe và giấy tờ, ghi chú mọi vết trầy xước có sẵn. Khách sẽ kiểm tra và xác nhận từng mục; mục nào chưa đúng khách sẽ yêu cầu bạn sửa.</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-3">
      <label className="text-xs font-semibold text-[#666666]">Số km trên đồng hồ *<input type="number" min="0" value={odometer} onChange={e => setOdometer(e.target.value)} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Nhiên liệu / pin: {fuel}%<input type="range" min="0" max="100" step="5" value={fuel} onChange={e => setFuel(e.target.value)} className="mt-3 w-full accent-[#FC6C26]"/></label>
      <label className="text-xs font-semibold text-[#666666]">Ghi chú chung<input value={note} maxLength={1000} onChange={e => setNote(e.target.value)} className={`${fieldClass} mt-1`}/></label>
    </div>
    {type === "RETURN" ? <div className="mt-3 grid gap-3 rounded-xl bg-[#F7F7F5] p-3 sm:grid-cols-2">
      <label className="text-xs font-semibold text-[#666666]">Phí khác (đ) – vệ sinh, hư hỏng…<input type="number" min="0" step="10000" value={fee} onChange={e => setFee(e.target.value)} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Lý do phí khác<input value={feeNote} maxLength={500} onChange={e => setFeeNote(e.target.value)} className={`${fieldClass} mt-1`}/></label>
      <p className="text-xs text-[#666666] sm:col-span-2">Phí quá km và trả trễ được hệ thống tự tính theo điều khoản đã chốt khi đặt xe.</p>
    </div> : null}
    <ul className="mt-4 grid gap-3 md:grid-cols-2">{handoverCategories.map(c => <li key={c.id} className="rounded-xl border border-[#E9E9E7] p-3">
      <p className="mb-2 text-sm font-semibold text-[#292929]">{c.label} {c.required ? <span className="text-[#B91C1C]">*</span> : <span className="text-xs font-normal text-[#666666]">(tuỳ chọn)</span>}</p>
      <PhotoInput value={items[c.id]?.photoUrl} onChange={(url, file) => setItem(c.id, { photoUrl: url, file })}/>
      <input value={items[c.id]?.note ?? ""} maxLength={1000} onChange={e => setItem(c.id, { note: e.target.value })} placeholder="Mô tả hiện trạng (VD: trầy 2cm cản trước)" className={`${fieldClass} mt-2`}/>
    </li>)}</ul>
    {localError || error ? <p role="alert" className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{localError || error}</p> : null}
    <button type="button" disabled={busy} onClick={submit} className="mt-4 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang gửi…" : "Gửi biên bản cho khách xác nhận"}</button>
  </section>;
}

/**
 * Hiển thị biên bản. Theo vai trò:
 *  - khách (mode="respond"): đánh dấu đúng / cần sửa cho từng mục đang chờ.
 *  - chủ xe (mode="revise"): sửa ảnh/mô tả các mục khách yêu cầu.
 */
export function HandoverView({ handover, booking, mode, busy, error, onRespond, onRevise }) {
    const [decisions, setDecisions] = useState({});
    const [revisions, setRevisions] = useState({});
    const [note, setNote] = useState("");
    const [disputeFees, setDisputeFees] = useState(false);
    const [newFee, setNewFee] = useState(booking?.otherFeeAmount ?? "");
    const [newFeeNote, setNewFeeNote] = useState(booking?.otherFeeNote ?? "");
    const [localError, setLocalError] = useState("");
    const open = handover.items.filter(i => i.status === "PENDING" || i.status === "REVISED");
    const disputed = handover.items.filter(i => i.status === "DISPUTED");

    function respond() {
        const missing = open.filter(i => decisions[i.id]?.accepted === undefined);
        if (missing.length) return setLocalError("Vui lòng đánh dấu tất cả các mục đang chờ.");
        const noNote = open.filter(i => decisions[i.id].accepted === false && !decisions[i.id].note?.trim());
        if (noNote.length) return setLocalError(`Ghi rõ cần sửa gì ở: ${noNote.map(i => i.categoryLabel).join(", ")}.`);
        if (disputeFees && !note.trim()) return setLocalError("Ghi rõ lý do không đồng ý với phí phát sinh vào ô ghi chú.");
        setLocalError("");
        onRespond({ customerNote: note.trim() || null, disputeFees: handover.type === "RETURN" ? disputeFees : null, decisions: open.map(i => ({ itemId: i.id, accepted: decisions[i.id].accepted, disputeNote: decisions[i.id].note?.trim() || null })) });
    }
    function revise() {
        setLocalError("");
        const data = { revisions: disputed.map(i => ({ itemId: i.id, conditionNote: revisions[i.id]?.note ?? i.conditionNote })) };
        if (handover.type === "RETURN" && newFee !== "") {
            data.otherFeeAmount = Number(newFee);
            data.otherFeeNote = newFeeNote.trim() || null;
        }
        const photos = disputed.map(i => revisions[i.id]?.file);
        onRevise({ data, photos });
    }
    const acceptAll = () => setDecisions(Object.fromEntries(open.map(i => [i.id, { accepted: true }])));

    return <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="text-base font-bold text-[#292929]">{typeLabel[handover.type]} <span className="text-xs font-normal text-[#666666]">• lần {handover.revision}</span></h3>
        <p className="text-xs text-[#666666]">Gửi lúc {formatDateTime(handover.submittedAt)}{handover.confirmedAt ? ` • xác nhận lúc ${formatDateTime(handover.confirmedAt)}` : ""}</p>
      </div>
      <StatusBadge meta={handoverMeta[handover.status]}/>
    </div>
    <dl className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-[#F7F7F5] p-3 text-sm sm:grid-cols-4">
      <div><dt className="text-xs text-[#666666]">Số km</dt><dd className="font-bold">{handover.odometerKm.toLocaleString("vi-VN")} km</dd></div>
      <div><dt className="text-xs text-[#666666]">Nhiên liệu / pin</dt><dd className="font-bold">{handover.fuelPercent}%</dd></div>
      {handover.type === "RETURN" && booking.pickupOdometerKm != null ? <div><dt className="text-xs text-[#666666]">Đã chạy</dt><dd className="font-bold">{(handover.odometerKm - booking.pickupOdometerKm).toLocaleString("vi-VN")} km</dd></div> : null}
      {handover.type === "RETURN" ? <div><dt className="text-xs text-[#666666]">Tổng thanh toán</dt><dd className="font-bold text-[#FC6C26]">{formatMoney(booking.finalAmount)}</dd></div> : null}
    </dl>
    {handover.ownerNote ? <p className="mt-2 text-sm text-[#292929]"><b>Chủ xe ghi chú:</b> {handover.ownerNote}</p> : null}
    {handover.customerNote ? <p className="mt-1 text-sm text-[#292929]"><b>Khách ghi chú:</b> {handover.customerNote}</p> : null}
    {mode === "respond" && open.length ? <button type="button" onClick={acceptAll} className="mt-3 text-xs font-bold text-[#047857]">Đánh dấu tất cả đúng hiện trạng</button> : null}

    <ul className="mt-3 grid gap-3 md:grid-cols-2">{handover.items.map(item => {
        const d = decisions[item.id];
        const canRespond = mode === "respond" && (item.status === "PENDING" || item.status === "REVISED");
        const canRevise = mode === "revise" && item.status === "DISPUTED";
        return <li key={item.id} className={`overflow-hidden rounded-xl border ${item.status === "DISPUTED" ? "border-[#FCA5A5]" : "border-[#E9E9E7]"}`}>
          <a href={revisions[item.id]?.photoUrl ?? item.photoUrl} target="_blank" rel="noreferrer"><img src={revisions[item.id]?.photoUrl ?? item.photoUrl} alt={item.categoryLabel} className="h-40 w-full object-cover"/></a>
          <div className="flex flex-col gap-2 p-3">
            <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold">{item.categoryLabel}</p><StatusBadge meta={itemMeta[item.status]}/></div>
            {item.conditionNote ? <p className="text-xs text-[#666666]">{item.conditionNote}</p> : null}
            {item.disputeNote ? <p className="rounded-lg bg-[#FEF2F2] px-2 py-1 text-xs text-[#B91C1C]"><b>Khách yêu cầu:</b> {item.disputeNote}</p> : null}
            {canRespond ? <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button type="button" onClick={() => setDecisions(c => ({ ...c, [item.id]: { accepted: true } }))} className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold ${d?.accepted === true ? "border-[#047857] bg-[#D1FAE5] text-[#047857]" : "border-[#E9E9E7]"}`}>Đúng hiện trạng</button>
                <button type="button" onClick={() => setDecisions(c => ({ ...c, [item.id]: { accepted: false, note: c[item.id]?.note ?? "" } }))} className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-bold ${d?.accepted === false ? "border-[#B91C1C] bg-[#FEE2E2] text-[#B91C1C]" : "border-[#E9E9E7]"}`}>Chưa đúng, cần sửa</button>
              </div>
              {d?.accepted === false ? <textarea rows={2} value={d.note} onChange={e => setDecisions(c => ({ ...c, [item.id]: { accepted: false, note: e.target.value } }))} placeholder="Cần sửa gì? VD: ảnh mờ, thiếu vết xước ở cửa trái…" className={fieldClass}/> : null}
            </div> : null}
            {canRevise ? <div className="flex flex-col gap-2 rounded-lg bg-[#FFF7F2] p-2">
              <PhotoInput value={revisions[item.id]?.photoUrl ?? item.photoUrl} onChange={(url, file) => setRevisions(c => ({ ...c, [item.id]: { ...c[item.id], photoUrl: url, file } }))} label="Chụp lại"/>
              <textarea rows={2} value={revisions[item.id]?.note ?? item.conditionNote ?? ""} onChange={e => setRevisions(c => ({ ...c, [item.id]: { ...c[item.id], note: e.target.value } }))} placeholder="Mô tả lại hiện trạng" className={fieldClass}/>
            </div> : null}
          </div>
        </li>;
    })}</ul>

    {mode === "respond" && (open.length || handover.status === "SUBMITTED") ? <div className="mt-4 flex flex-col gap-2">
      <textarea rows={2} value={note} maxLength={1000} onChange={e => setNote(e.target.value)} placeholder="Ghi chú thêm cho chủ xe (tuỳ chọn)" className={fieldClass}/>
      {handover.type === "RETURN" ? <label className="flex items-center gap-2 text-sm text-[#292929]">
        <input type="checkbox" checked={disputeFees} onChange={e => setDisputeFees(e.target.checked)}/>
        Tôi không đồng ý với số tiền phí phát sinh (ghi lý do vào ô ghi chú)
      </label> : null}
      <button type="button" disabled={busy} onClick={respond} className="self-start rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang gửi…" : "Gửi xác nhận biên bản"}</button>
      <p className="text-xs text-[#666666]">Chỉ khi tất cả các mục được đánh dấu “Đúng hiện trạng”, {handover.type === "PICKUP" ? "chuyến thuê mới bắt đầu" : "chuyến thuê mới hoàn tất"}.</p>
    </div> : null}
    {mode === "revise" && handover.type === "RETURN" && handover.status === "DISPUTED" ? <div className="mt-4 grid gap-2 sm:grid-cols-2">
      <label className="text-xs font-semibold text-[#666666]">Phí khác (đ) — sửa nếu khách không đồng ý<input type="number" min={0} value={newFee} onChange={e => setNewFee(e.target.value)} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Lý do phí khác<input value={newFeeNote} maxLength={500} onChange={e => setNewFeeNote(e.target.value)} className={`${fieldClass} mt-1`}/></label>
    </div> : null}
    {mode === "revise" && (disputed.length || (handover.type === "RETURN" && handover.status === "DISPUTED")) ? <button type="button" disabled={busy} onClick={revise} className="mt-4 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Đang gửi…" : disputed.length ? `Gửi lại ${disputed.length} mục đã sửa` : "Gửi lại biên bản (đã điều chỉnh phí)"}</button> : null}
    {localError || error ? <p role="alert" className="mt-3 rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{localError || error}</p> : null}
  </section>;
}
