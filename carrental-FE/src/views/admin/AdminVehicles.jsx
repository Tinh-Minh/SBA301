"use client";
import { useState } from "react";
import { AdminDialog, AdminPageHeader, PrimaryButton, StatusPill } from "@/components/admin/admin-ui";
import { Money } from "@/components/owner/money";
import { loadAdminSeed } from "@/services/mock/admin-db";

const tone = { PENDING: "warning", ACTIVE: "success", REJECTED: "danger" };
const label = { PENDING: "Chờ duyệt niêm yết", ACTIVE: "Đã niêm yết", REJECTED: "Từ chối niêm yết" };

export default function AdminVehicles() {
    const [vehicles, setVehicles] = useState(() => loadAdminSeed().vehicles);
    const [selectedId, setSelectedId] = useState("v1");
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const selected = vehicles.find(item => item.id === selectedId) ?? vehicles[0];

    function setStatus(status) {
        setVehicles(list => list.map(item => item.id === selected.id ? { ...item, status } : item));
        setRejecting(false);
        setReason("");
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A03" title="Duyệt xe & Thẩm định phương tiện" description="Đối soát cavet, đăng kiểm, bảo hiểm và bộ ảnh trước khi niêm yết."/>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <div className="flex flex-col gap-3">
        {vehicles.map(item => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`rounded-2xl border bg-white p-4 text-left shadow-sm ${item.id === selected.id ? "border-[#FC6C26]" : "border-[#E9E9E7]"}`}>
          <div className="flex items-start justify-between gap-2">
            <p className="font-bold text-[#292929]">{item.title}</p>
            <StatusPill tone={tone[item.status]}>{label[item.status]}</StatusPill>
          </div>
          <p className="mt-1 whitespace-nowrap text-sm text-[#666666]">{item.plate} • {item.owner} • {item.ownerCode}</p>
        </button>)}
      </div>
      <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#292929]">{selected.title}</h2>
        <p className="whitespace-nowrap text-sm text-[#666666]">{selected.plate} • {selected.owner}</p>
        <p className="mt-2 whitespace-nowrap text-sm text-[#292929]">Giá <Money amount={selected.pricePerDay}/>/ngày • Cọc <Money amount={selected.deposit}/></p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["Ảnh trước", "Khoang lái", "Ghế sau", "Đuôi xe", "Cửa sổ trời", "Cốp"].map(slot => <div key={slot} className="flex h-16 items-center justify-center rounded-xl bg-[#F7F7F5] text-[11px] font-bold text-[#666666]">{slot}</div>)}
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {selected.checks.map(check => <li key={check} className="whitespace-nowrap rounded-xl bg-[#D1FAE5] px-3 py-2 text-sm font-semibold text-[#047857]">✓ {check}</li>)}
        </ul>
        <p className="mt-3 text-xs text-[#666666]">Cọc {selected.deposit.toLocaleString("vi-VN")} đ do chủ xe thu tại điểm giao, không giữ trên nền tảng.</p>
        <div className="mt-4 flex flex-col gap-2">
          <PrimaryButton onClick={() => setStatus("ACTIVE")}>✓ Phê duyệt niêm yết xe ➔</PrimaryButton>
          <button type="button" onClick={() => setRejecting(true)} className="whitespace-nowrap rounded-xl border border-[#EF4444] px-4 py-2.5 text-sm font-bold text-[#EF4444]">Từ chối niêm yết</button>
        </div>
      </aside>
    </div>
    {rejecting ? <AdminDialog title="Từ chối niêm yết xe" onClose={() => setRejecting(false)}>
      <label className="block text-sm text-[#666666]">Lý do
        <textarea value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 text-[#292929]" rows={3}/>
      </label>
      <div className="mt-3"><PrimaryButton onClick={() => setStatus("REJECTED")}>Xác nhận từ chối</PrimaryButton></div>
    </AdminDialog> : null}
  </div>;
}
