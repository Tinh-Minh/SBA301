import { DetailItem } from "@/components/DetailItem.jsx";
import { useAdminOrderDetail } from "@/hooks/useAdmin.js";
import { AdminDialog, AdminState } from "@/components/admin/AdminUi.jsx";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney, orderStatusLabels, paymentMethodLabels, rentalTypeLabels, transactionStatusLabels, transactionTypeLabels } from "@/utils/labels.js";
import { OrderExtraFeesSection } from "@/components/bookings/OrderExtraFeesSection.jsx";

export const tabs = [{ id: "", label: "Tất cả" }, ...["PENDING", "CONFIRMED", "ONGOING", "COMPLETED", "CANCELLED", "REJECTED", "EXPIRED"].map(id => ({ id, label: orderStatusLabels[id] }))];
export const orderTone = { CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", PENDING: "warning", CANCELLED: "danger", REJECTED: "danger", EXPIRED: "neutral" };
export const payTone = { UNPAID: "warning", PAID: "success", REFUNDED: "info" };

export function OrderDialog({ order, onClose }) {
    const detail = useAdminOrderDetail(order.id);
    return <AdminDialog title={`Đơn ${order.orderCode}`} onClose={onClose}>
    <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto text-sm">
      <dl className="grid grid-cols-2 gap-2">
        <DetailItem term="Hình thức" value={`${rentalTypeLabels[order.rentalType] ?? order.rentalType} × ${order.quantity}`}/>
        <DetailItem term="Đơn giá" value={formatMoney(order.unitPrice)}/>
        <DetailItem term="Tiền thuê" value={formatMoney(order.rentalAmount)}/>
        <DetailItem term="Giảm giá" value={`${formatMoney(order.discountAmount)}${order.voucherCode ? ` (${order.voucherCode})` : ""}`}/>
        <DetailItem term="Tổng thanh toán" value={formatMoney(order.totalAmount)}/>
        <DetailItem term="Tiền cọc" value={formatMoney(order.depositAmount)}/>
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
        <OrderExtraFeesSection order={order} />
      </> : null}
    </div>
  </AdminDialog>;
}
