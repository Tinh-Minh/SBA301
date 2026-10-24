"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { ProfileLayout } from "@/components/profile-layout";
import { LivePage, LiveState, Pill } from "@/components/live-ui";
import { useAsyncResource } from "@/hooks/use-async-resource";
import { formatDateTime } from "@/lib/datetime";
import { formatMoney, orderStatusLabels, orderStatusTone, paymentStatusLabels } from "@/lib/labels";
import { rentalService } from "@/services/order.service";

const groups = {
    active: new Set(["PENDING", "CONFIRMED", "ONGOING"]),
    history: new Set(["COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"]),
};

export default function MyRentals({ mode = "all" }) {
    const load = useCallback(async () => {
        const orders = await rentalService.listMine();
        const allowed = groups[mode];
        return allowed ? orders.filter(order => allowed.has(order.status)) : orders;
    }, [mode]);
    const list = useAsyncResource(load, mode);
    const [status, setStatus] = useState("");
    const rows = (list.data ?? []).filter(order => !status || order.status === status);
    const body = <div className="flex flex-col gap-4">
    <LiveState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length && !status} label="đơn thuê" onRetry={list.reload}/>
    {list.data?.length ? <div className="flex flex-wrap gap-2">
      <Filter id="" label="Tất cả" value={status} onChange={setStatus}/>
      {[...new Set(list.data.map(order => order.status))].map(id => <Filter key={id} id={id} label={orderStatusLabels[id] ?? id} value={status} onChange={setStatus}/>)}
    </div> : null}
    {rows.map(order => <Link key={order.id} href={`/orders/${order.id}`} className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm hover:border-[#FC6C26]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</span>
        <span className="flex gap-2">
          <Pill className={orderStatusTone[order.status]}>{orderStatusLabels[order.status] ?? order.status}</Pill>
          <Pill className="bg-[#F3F4F6] text-[#374151]">{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</Pill>
        </span>
      </div>
      <p className="mt-2 font-bold text-[#292929]">{order.carName} • {order.licensePlate}</p>
      <p className="text-sm text-[#666666]">{formatDateTime(order.startTime)} → {formatDateTime(order.endTime)}</p>
      <p className="mt-1 text-sm font-semibold">{formatMoney(order.totalAmount)} • chủ xe {order.ownerName}</p>
    </Link>)}
    {list.data?.length && !rows.length ? <p className="text-sm text-[#666666]">Không có đơn ở trạng thái này.</p> : null}
  </div>;
    if (mode === "active")
        return <LivePage width="max-w-3xl">
      <RequireAuth title="Đăng nhập để xem chuyến xe">
        <h1 className="mb-4 text-2xl font-bold text-[#292929]">Chuyến xe của tôi</h1>
        <p className="mb-4 text-sm text-[#666666]">Các đơn đang chờ duyệt, đã xác nhận hoặc đang thuê.</p>
        {body}
      </RequireAuth>
    </LivePage>;
    return <ProfileLayout live active={mode === "history" ? "history" : "orders"} title={mode === "history" ? "Lịch sử chuyến đi" : "Đơn thuê xe"} description={mode === "history" ? "Các chuyến đã hoàn thành, bị từ chối hoặc đã hủy." : "Theo dõi yêu cầu thuê và thanh toán."}>
    {body}
  </ProfileLayout>;
}

function Filter({ id, label, value, onChange }) {
    return <button type="button" onClick={() => onChange(id)} className={`rounded-full px-3 py-1.5 text-xs font-bold ${value === id ? "bg-[#FC6C26] text-white" : "border border-[#E9E9E7] bg-white"}`}>{label}</button>;
}
