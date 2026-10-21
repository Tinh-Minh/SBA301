"use client";
import { useState } from "react";
import { AdminPageHeader, PrimaryButton, StatusPill } from "@/components/admin/admin-ui";
import { Money } from "@/components/owner/money";
import { loadAdminSeed } from "@/services/mock/admin-db";

const tone = { OPEN: "warning", IN_REVIEW: "info", RESOLVED: "success" };
const label = { OPEN: "OPEN", IN_REVIEW: "IN_REVIEW", RESOLVED: "RESOLVED" };
const decisions = [
    { id: "refund", text: "Hoàn tiền cho Khách" },
    { id: "owner", text: "Giải ngân cho Chủ xe" },
    { id: "split", text: "Chia sẻ phụ phí 50/50" },
];

export default function AdminDisputes() {
    const [cases, setCases] = useState(() => loadAdminSeed().disputes);
    const [selectedId, setSelectedId] = useState("d1");
    const [decision, setDecision] = useState("refund");
    const [note, setNote] = useState("");
    const selected = cases.find(item => item.id === selectedId) ?? cases[0];
    const half = Math.round(selected.extraFee / 2);

    function resolve() {
        const text = decisions.find(item => item.id === decision).text;
        setCases(list => list.map(item => item.id === selected.id ? { ...item, status: "RESOLVED", resolution: note ? `${text}. ${note}` : text } : item));
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A07" title="Xử lý tranh chấp & Khiếu nại" description="Đối chiếu bằng chứng hai bên rồi chốt cách xử lý phụ phí."/>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col gap-3">
        {cases.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`rounded-2xl border bg-white p-4 text-left shadow-sm ${item.id === selected.id ? "border-[#FC6C26]" : "border-[#E9E9E7]"}`}>
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-nowrap font-mono text-xs font-bold text-[#FC6C26]">{item.caseCode}</span>
            <StatusPill tone={tone[item.status]}>{label[item.status]}</StatusPill>
          </div>
          <p className="mt-1 whitespace-nowrap text-sm font-bold text-[#292929]">{item.reason}</p>
          <p className="whitespace-nowrap text-xs text-[#666666]">{item.orderCode} • {item.raisedBy}</p>
        </button>)}
      </div>
      <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <h2 className="whitespace-nowrap text-lg font-bold text-[#292929]">{selected.caseCode}</h2>
        <p className="mt-1 text-sm text-[#666666]">Khách {selected.raisedBy} • Chủ xe {selected.owner}</p>
        <p className="mt-3 whitespace-nowrap text-sm font-semibold text-[#292929]">Phụ phí <Money amount={selected.extraFee}/></p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-[#666666]">
          <div className="rounded-xl bg-[#F7F7F5] p-3">Ảnh khách thuê</div>
          <div className="rounded-xl bg-[#F7F7F5] p-3">Ảnh chủ xe</div>
          <div className="col-span-2 rounded-xl bg-[#F7F7F5] p-3">Video bàn giao</div>
        </div>
        <fieldset className="mt-4 flex flex-col gap-2">
          <legend className="text-sm font-bold text-[#292929]">Quyết định</legend>
          {decisions.map(item => <label key={item.id} className="flex items-center gap-2 text-sm text-[#292929]">
            <input type="radio" name="decision" checked={decision === item.id} onChange={() => setDecision(item.id)}/>
            <span className="whitespace-nowrap">{item.text}{item.id === "split" ? ` (${half.toLocaleString("vi-VN")} đ mỗi bên)` : ""}</span>
          </label>)}
        </fieldset>
        <label className="mt-3 block text-sm font-semibold text-[#292929]">Ghi chú phân định
          <textarea value={note} onChange={event => setNote(event.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 font-normal"/>
        </label>
        {selected.resolution ? <p className="mt-3 text-sm font-semibold text-[#047857]">{selected.resolution}</p> : null}
        <div className="mt-4"><PrimaryButton onClick={resolve} disabled={selected.status === "RESOLVED"}>Chốt quyết định phân định ➔</PrimaryButton></div>
      </aside>
    </div>
  </div>;
}
