import { useAdminOrderDetail } from "@/shared/hooks/useAdmin.js";
import { AdminDialog, AdminState } from "@/shared/components/admin/AdminUi.jsx";
import { formatDateTime } from "@/shared/utils/datetime.js";
import { formatMoney, orderStatusLabels, paymentMethodLabels, rentalTypeLabels, transactionStatusLabels, transactionTypeLabels } from "@/shared/utils/labels.js";

export const tabs = [{ id: "", label: "Tất cả" }, ...["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"].map(id => ({ id, label: orderStatusLabels[id] }))];
export const orderTone = { CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", PENDING: "warning", CANCELLED: "danger", REJECTED: "danger", EXPIRED: "neutral" };
export const payTone = { UNPAID: "warning", PAID: "success", REFUNDED: "info" };

export function OrderDialog({ order, onClose }) {
    const detail = useAdminOrderDetail(order.id);
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
