import { useCallback, useState } from "react";
import { AdminPageHeader, AdminState, Pager, StatusPill, Tabs } from "@/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney, orderStatusLabels, paymentStatusLabels } from "@/utils/labels.js";
import { adminOrderService } from "@/hooks/useAdmin.js";
import { OrderDialog, orderTone, payTone, tabs } from "@/components/bookings/OrderDialog.jsx";

export default function AdminOrders() {
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(0);
    const [openId, setOpenId] = useState(null);
    const load = useCallback(() => adminOrderService.list({ status: status || undefined, page, size: 15 }), [status, page]);
    const list = useApiQuery(["admin", "orders", { status, page }], load);
    const rows = list.data?.content ?? [];
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A05" title="Đơn thuê toàn hệ thống" description={`Theo dõi trạng thái đơn, thanh toán và nhật ký xử lý${list.data ? ` • ${list.data.totalElements} đơn` : ""}.`}/>
    <Tabs items={tabs} value={status} onChange={id => { setStatus(id); setPage(0); }}/>
    <AdminState loading={list.loading && !list.data} error={list.error} empty={list.data && !rows.length} label="đơn thuê" onRetry={list.reload}/>
    {rows.length ? <div className="overflow-x-auto rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-[#666666]"><tr>{["Mã đơn", "Xe", "Khách → Chủ xe", "Thời gian", "Tổng tiền", "Thanh toán", "Trạng thái"].map(head => <th key={head} className="whitespace-nowrap px-4 py-3 font-bold">{head}</th>)}</tr></thead>
        <tbody>
          {rows.map(order => <tr key={order.id} onClick={() => setOpenId(order.id)} className="cursor-pointer border-t border-[#E9E9E7] hover:bg-[#FFF7F2]">
            <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold">{order.carName}<p className="text-xs font-normal text-[#666666]">{order.licensePlate}</p></td>
            <td className="whitespace-nowrap px-4 py-3">{order.customerName}<p className="text-xs text-[#666666]">→ {order.ownerName}</p></td>
            <td className="whitespace-nowrap px-4 py-3 text-xs">{formatDateTime(order.startTime)}<br/>→ {formatDateTime(order.endTime)}</td>
            <td className="whitespace-nowrap px-4 py-3 font-semibold">{formatMoney(order.totalAmount)}</td>
            <td className="px-4 py-3"><StatusPill tone={payTone[order.paymentStatus]}>{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</StatusPill></td>
            <td className="px-4 py-3"><StatusPill tone={orderTone[order.status]}>{orderStatusLabels[order.status] ?? order.status}</StatusPill></td>
          </tr>)}
        </tbody>
      </table>
    </div> : null}
    <Pager page={page} totalPages={list.data?.totalPages} onPage={setPage}/>
    {openId ? <OrderDialog order={rows.find(order => order.id === openId)} onClose={() => setOpenId(null)}/> : null}
  </div>;
}
