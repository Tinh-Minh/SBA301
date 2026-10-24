import { useCallback, useState } from "react";
import { AdminDialog, AdminPageHeader, AdminState, Pager, StatusPill, Tabs } from "@/shared/components/admin/AdminUi.jsx";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { formatMoney, orderStatusLabels, paymentMethodLabels, paymentStatusLabels, rentalTypeLabels, transactionStatusLabels, transactionTypeLabels } from "@/shared/utils/labels.js";
import { request, toPage } from "@/services/http.js";
import { adminOrderService } from "@/services/admin.service";

const tabs = [{ id: "", label: "Tất cả" }, ...["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"].map(id => ({ id, label: orderStatusLabels[id] }))];
const orderTone = { CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", PENDING: "warning", CANCELLED: "danger", REJECTED: "danger", EXPIRED: "neutral" };
const payTone = { UNPAID: "warning", PAID: "success", REFUNDED: "info" };

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

function OrderDialog({ order, onClose }) {
    const load = useCallback(async () => {
        const [logs, transactions] = await Promise.all([
            request(`/api/orders/${order.id}/logs`).catch(() => []),
            request("/api/transactions", { query: { orderId: order.id, size: 50 } }).then(toPage).then(page => page.content).catch(() => []),
        ]);
        return { logs: Array.isArray(logs) ? logs : [], transactions };
    }, [order.id]);
    const detail = useApiQuery(["admin", "order-detail", order.id], load);
    return <AdminDialog title={`Đơn ${order.orderCode}`} onClose={onClose}>
    <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto text-sm">
      <dl className="grid grid-cols-2 gap-2">
        <Item term="Hình thức" value={`${rentalTypeLabels[order.rentalType] ?? order.rentalType} × ${order.quantity}`}/>
        <Item term="Đơn giá" value={formatMoney(order.unitPrice)}/>
        <Item term="Tiền thuê" value={formatMoney(order.rentalAmount)}/>
        <Item term="Giảm giá" value={`${formatMoney(order.discountAmount)}${order.voucherCode ? ` (${order.voucherCode})` : ""}`}/>
        <Item term="Tổng thanh toán" value={formatMoney(order.totalAmount)}/>
        <Item term="Tiền cọc" value={formatMoney(order.depositAmount)}/>
      </dl>
      {order.cancelReason ? <p className="rounded-xl bg-[#FEF2F2] p-3 text-[#B91C1C]">Lý do hủy/từ chối: {order.cancelReason}</p> : null}
      {order.note ? <p className="rounded-xl bg-[#F7F7F5] p-3">Ghi chú: {order.note}</p> : null}
      <AdminState loading={detail.loading && !detail.data} error={detail.error} label="nhật ký"/>
      {detail.data ? <>
        <section>
          <h3 className="font-bold">Giao dịch ({detail.data.transactions.length})</h3>
          {detail.data.transactions.map(tx => <p key={tx.id} className="mt-1 text-xs">#{tx.id} • {transactionTypeLabels[tx.transactionType] ?? tx.transactionType} • {paymentMethodLabels[tx.method] ?? tx.method} • {formatMoney(tx.amount)} • <b>{transactionStatusLabels[tx.status] ?? tx.status}</b></p>)}
        </section>
        <section>
          <h3 className="font-bold">Nhật ký trạng thái</h3>
          <ol className="mt-1 flex flex-col gap-1 border-l border-[#E9E9E7] pl-3 text-xs">
            {detail.data.logs.map((log, index) => <li key={log.id ?? index}><b>{orderStatusLabels[log.toStatus] ?? log.toStatus ?? log.action}</b> • {formatDateTime(log.createdAt)}{log.actorName ? ` • ${log.actorName}` : ""}{log.note ? ` • ${log.note}` : ""}</li>)}
          </ol>
        </section>
      </> : null}
    </div>
  </AdminDialog>;
}

function Item({ term, value }) {
    return <div><dt className="text-[11px] uppercase text-[#666666]">{term}</dt><dd className="font-semibold text-[#292929]">{value}</dd></div>;
}
