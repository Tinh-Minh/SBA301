"use client";
import { useMemo, useState } from "react";
import { AdminDialog, AdminPageHeader, PrimaryButton, StatusPill } from "@/components/admin/admin-ui";
import { loadAdminSeed } from "@/services/mock/admin-db";

const tabs = [
    { id: "all", label: "Tất cả (1.240)" },
    { id: "PENDING", label: "Chờ duyệt KYC (12)" },
    { id: "VERIFIED", label: "Đã xác thực" },
    { id: "LOCKED", label: "Bị khóa" },
];
const tone = { PENDING: "warning", VERIFIED: "success", LOCKED: "danger" };
const label = { PENDING: "Chờ duyệt KYC", VERIFIED: "Đã xác thực", LOCKED: "Bị khóa" };

export default function AdminUsers() {
    const [users, setUsers] = useState(() => loadAdminSeed().users);
    const [tab, setTab] = useState("PENDING");
    const [selectedId, setSelectedId] = useState("u1");
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");
    const visible = useMemo(() => users.filter(user => tab === "all" || user.status === tab), [users, tab]);
    const selected = users.find(user => user.id === selectedId) ?? visible[0] ?? users[0];

    function approve() {
        setUsers(list => list.map(user => user.id === selected.id ? { ...user, status: "VERIFIED" } : user));
    }
    function reject() {
        setUsers(list => list.map(user => user.id === selected.id ? { ...user, status: "LOCKED" } : user));
        setRejecting(false);
        setReason("");
    }

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A02" title="Người dùng & KYC" description="Đối chiếu CCCD, GPLX và điểm khớp khuôn mặt trước khi mở tài khoản."/>
    <div className="flex flex-wrap gap-2">
      {tabs.map(item => <button key={item.id} type="button" onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold ${tab === item.id ? "bg-[#FC6C26] text-white" : "border border-[#E9E9E7] bg-white text-[#292929]"}`}>{item.label}</button>)}
    </div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã KH", "Khách hàng", "Chứng từ", "Match AI", "Trạng thái"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
          <tbody>
            {visible.map(user => <tr key={user.id} onClick={() => setSelectedId(user.id)} className={`cursor-pointer border-t border-[#E9E9E7] ${user.id === selected?.id ? "bg-[#FFF7F2]" : ""}`}>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-[#FC6C26]">{user.code}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-[#292929]">{user.name}</td>
              <td className="whitespace-nowrap px-4 py-3 text-[#666666]">{user.docs}</td>
              <td className="whitespace-nowrap px-4 py-3">{user.match}%</td>
              <td className="px-4 py-3"><StatusPill tone={tone[user.status]}>{label[user.status]}</StatusPill></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {selected ? <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#292929]">{selected.name}</h2>
        <p className="whitespace-nowrap text-xs text-[#666666]">{selected.code} • {selected.city}</p>
        <dl className="mt-4 grid gap-2 text-sm">
          <Row term="CCCD 12 số" value={selected.cccd}/>
          <Row term="GPLX" value={selected.license}/>
          <Row term="AI Face Match" value={`${selected.match}% • ${selected.tier}`}/>
        </dl>
        <div className="mt-5 flex flex-col gap-2">
          <PrimaryButton onClick={approve} disabled={selected.status === "VERIFIED"}>✓ Phê duyệt eKYC tài khoản ➔</PrimaryButton>
          <button type="button" onClick={() => setRejecting(true)} className="whitespace-nowrap rounded-xl border border-[#EF4444] px-4 py-2.5 text-sm font-bold text-[#EF4444]">Từ chối hồ sơ</button>
        </div>
      </aside> : null}
    </div>
    {rejecting ? <AdminDialog title="Từ chối hồ sơ eKYC" onClose={() => setRejecting(false)}>
      <label className="block text-sm text-[#666666]">Lý do từ chối
        <textarea value={reason} onChange={event => setReason(event.target.value)} className="mt-1 w-full rounded-xl border border-[#E9E9E7] p-3 text-[#292929]" rows={3}/>
      </label>
      <div className="mt-3"><PrimaryButton onClick={reject}>Xác nhận từ chối</PrimaryButton></div>
    </AdminDialog> : null}
  </div>;
}

function Row({ term, value }) {
    return <div className="flex items-center justify-between gap-3"><dt className="text-[#666666]">{term}</dt><dd className="whitespace-nowrap font-semibold text-[#292929]">{value}</dd></div>;
}
