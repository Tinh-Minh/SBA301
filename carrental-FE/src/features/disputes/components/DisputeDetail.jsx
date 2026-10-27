import { useState } from "react";
import { PrimaryButton } from "@/shared/components/admin/AdminUi.jsx";
import { useApiMutation } from "@/shared/hooks/useApiMutation.js";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { disputeStatusLabels } from "@/shared/utils/labels.js";
import { disputeService } from "@/shared/hooks/useAdmin.js";

export const tone = { OPEN: "warning", IN_REVIEW: "info", RESOLVED: "success", REJECTED: "danger" };
export const tabs = [{ id: "", label: "Tất cả" }, ...["OPEN", "IN_REVIEW", "RESOLVED", "REJECTED"].map(id => ({ id, label: disputeStatusLabels[id] }))];
const decisions = [
    { id: "refund", text: "Hoàn tiền cho khách thuê" },
    { id: "owner", text: "Giải ngân phụ phí cho chủ xe" },
    { id: "split", text: "Chia sẻ phụ phí 50/50" },
    { id: "other", text: "Khác (ghi rõ bên dưới)" },
];

export function DisputeDetail({ dispute, onDone }) {
    const [decision, setDecision] = useState("refund");
    const [approvedAmount, setApprovedAmount] = useState("");
    const [note, setNote] = useState("");
    const resolve = useApiMutation((status) => {
        const text = decisions.find(item => item.id === decision).text;
        const resNote = status === "IN_REVIEW" ? note || "Đang xem xét" : [status === "RESOLVED" ? text : "Bác bỏ khiếu nại", note].filter(Boolean).join(". ");
        const refundAmt = status === "RESOLVED" && (decision === "refund" || approvedAmount) ? approvedAmount : null;
        return disputeService.resolve(dispute.id, status, resNote, refundAmt);
    }, onDone);
    const closed = dispute.status === "RESOLVED" || dispute.status === "REJECTED";
    return <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold text-[#292929]">KN-{dispute.id} • {dispute.reason}</h2>
    <p className="mt-1 text-sm text-[#666666]">Đơn {dispute.orderCode} • Người khiếu nại {dispute.raisedByName}{dispute.extraFeeId ? ` • Phụ phí #${dispute.extraFeeId}` : ""}</p>
    {dispute.description ? <p className="mt-3 whitespace-pre-line rounded-xl bg-[#F7F7F5] p-3 text-sm">{dispute.description}</p> : null}
    <h3 className="mt-4 text-sm font-bold text-[#292929]">Bằng chứng ({dispute.evidences?.length ?? 0})</h3>
    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
      {(dispute.evidences ?? []).map(evidence => <a key={evidence.id} href={evidence.fileUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-[#E9E9E7] bg-[#F7F7F5]">
        {evidence.fileType === "IMAGE" ? <img src={evidence.fileUrl} alt={evidence.description ?? "Bằng chứng"} className="h-28 w-full object-cover"/> : <span className="block p-3 font-bold text-[#FC6C26]">{evidence.fileType} ↗</span>}
        {evidence.description ? <span className="block p-2 text-[#666666]">{evidence.description}</span> : null}
      </a>)}
    </div>
    {closed ? <div className="mt-4 rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]">
      <p className="font-bold">{disputeStatusLabels[dispute.status]} bởi {dispute.resolvedByName ?? "quản trị viên"} • {formatDateTime(dispute.resolvedAt)}</p>
      {dispute.resolutionNote ? <p className="mt-1">{dispute.resolutionNote}</p> : null}
    </div> : <>
      <fieldset className="mt-4 flex flex-col gap-2">
        <legend className="text-sm font-bold text-[#292929]">Quyết định</legend>
        {decisions.map(item => <label key={item.id} className="flex items-center gap-2 text-sm text-[#292929]">
          <input type="radio" name="decision" checked={decision === item.id} onChange={() => setDecision(item.id)}/>
          <span>{item.text}</span>
        </label>)}
      </fieldset>
      {decision === "refund" ? (
        <label className="mt-3 block text-sm font-semibold text-[#292929]">Số tiền hoàn duyệt (VND)
          <input
            type="number"
            min="0"
            step="1000"
            placeholder="Để trống nếu hoàn toàn bộ số tiền giao dịch gốc"
            value={approvedAmount}
            onChange={event => setApprovedAmount(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-2.5 font-normal"
          />
        </label>
      ) : null}
      <label className="mt-3 block text-sm font-semibold text-[#292929]">Ghi chú phân định
        <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 font-normal"/>
      </label>
      {resolve.error ? <p className="mt-2 text-sm text-[#B91C1C]">{resolve.error.message}</p> : null}
      <div className="mt-4 flex flex-col gap-2">
        <PrimaryButton onClick={() => void resolve.run("RESOLVED")} disabled={resolve.running}>Chốt quyết định phân định ➔</PrimaryButton>
        <div className="grid grid-cols-2 gap-2">
          {dispute.status === "OPEN" ? <button type="button" disabled={resolve.running} onClick={() => void resolve.run("IN_REVIEW")} className="rounded-xl border border-[#E9E9E7] px-3 py-2 text-sm font-bold">Chuyển sang xem xét</button> : <span/>}
          <button type="button" disabled={resolve.running} onClick={() => void resolve.run("REJECTED")} className="rounded-xl border border-[#EF4444] px-3 py-2 text-sm font-bold text-[#EF4444]">Bác bỏ khiếu nại</button>
        </div>
      </div>
    </>}
  </aside>;
}
