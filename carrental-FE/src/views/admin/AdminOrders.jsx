"use client";
import { useMemo, useState } from "react";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { Money } from "@/components/owner/money";
import { calculatePayout } from "@/lib/owner/finance";
import { loadAdminSeed } from "@/services/mock/admin-db";

const filters = ["all", "PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED"];
const tone = { PENDING: "warning", CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", CANCELLED: "danger" };
const label = { PENDING: "PENDING", CONFIRMED: "CONFIRMED", ONGOING: "ONGOING", COMPLETED: "COMPLETED", CANCELLED: "CANCELLED" };

export default function AdminOrders() {
    const orders = useMemo(() => loadAdminSeed().orders, []);
    const [filter, setFilter] = useState("all");
    const [selectedId, setSelectedId] = useState("ord-904");
    const visible = orders.filter(order => filter === "all" || order.status === filter);
    const selected = orders.find(order => order.id === selectedId) ?? visible[0];
    const money = selected ? calculatePayout(selected) : null;

    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A05" title="Quản lý đơn thuê toàn hệ thống" description="Theo dõi đơn, tiền thuê và telemetry. Phí nền tảng tính 10% trên tiền thuê."/>
    <div className="flex flex-wrap gap-2">{filters.map(item => <button key={item} type="button" onClick={() => setFilter(item)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-bold ${filter === item ? "bg-[#FC6C26] text-white" : "border border-[#E9E9E7] bg-white text-[#292929]"}`}>{item === "all" ? "Tất cả" : item}</button>)}</div>
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã đơn", "Xe", "Người thuê", "Chủ xe", "Thời gian", "Tổng tiền", "Trạng thái"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
          <tbody>
            {visible.map(order => <tr key={order.id} onClick={() => setSelectedId(order.id)} className={`cursor-pointer border-t border-[#E9E9E7] ${order.id === selected?.id ? "bg-[#FFF7F2]" : ""}`}>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{order.carTitle}<div className="text-xs text-[#666666]">{order.plate}</div></td>
              <td className="whitespace-nowrap px-4 py-3">{order.renter}</td>
              <td className="whitespace-nowrap px-4 py-3">{order.owner}</td>
              <td className="whitespace-nowrap px-4 py-3">{order.period}</td>
              <td className="whitespace-nowrap px-4 py-3"><Money amount={order.rentalAmount}/></td>
              <td className="px-4 py-3"><StatusPill tone={tone[order.status]}>{label[order.status]}</StatusPill></td>
            </tr>)}
          </tbody>
        </table>
      </div>
      {selected && money ? <aside className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <h2 className="whitespace-nowrap text-base font-bold text-[#292929]">{selected.orderCode}</h2>
        <p className="mt-1 whitespace-nowrap text-sm text-[#666666]">{selected.carTitle} • {selected.plate}</p>
        <dl className="mt-4 grid gap-2 text-sm">
          <Line term="GPS" value={selected.telemetry.gps}/>
          <Line term="Odometer" value={`${selected.telemetry.odometerKm} km`}/>
          <Line term="Pin" value={selected.telemetry.batteryPercent == null ? "—" : `${selected.telemetry.batteryPercent}%`}/>
          <Line term="Tiền thuê" value={<Money amount={money.grossAmount}/>}/>
          <Line term="Phí CarDB 10%" value={<Money amount={money.platformFee}/>}/>
          <Line term="Thực nhận chủ xe" value={<Money amount={money.netAmount}/>}/>
          <Line term="Cọc tại điểm giao" value={<Money amount={selected.depositAmount}/>}/>
        </dl>
        <p className="mt-3 text-xs text-[#666666]">Cọc do chủ xe thu khi nhận xe, không giữ escrow. Tiền thuê giải ngân trong 24 giờ sau khi biên bản trả xe C10-B được xác nhận.</p>
        <div className="mt-3"><StatusPill tone="warning">Escrow chờ C10-B</StatusPill></div>
      </aside> : null}
    </div>
  </div>;
}

function Line({ term, value }) {
    return <div className="flex items-center justify-between gap-3"><dt className="text-[#666666]">{term}</dt><dd className="whitespace-nowrap font-semibold text-[#292929]">{value}</dd></div>;
}
