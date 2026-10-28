import { transactionService } from "@/services/paymentService.js";
import { usePaymentDetail } from "@/hooks/usePayments.js";
import { Link } from "react-router";
import { useState } from "react";
import { LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatMoney, paymentMethodLabels, paymentStatusLabels } from "@/utils/labels.js";

export function Pay({ orderId }) {
    const detail = usePaymentDetail(orderId);
    const [method, setMethod] = useState("VNPAY");
    const [pending, setPending] = useState(null);
    const start = useApiMutation(async (kind) => {
        const order = detail.data.order;
        const tx = kind === "deposit"
            ? await transactionService.createDeposit({ orderId, amount: Number(order.depositAmount), method })
            : await transactionService.createPayment({ orderId, amount: Number(order.totalAmount), method });
        setPending(tx);
        if (tx.paymentUrl)
            window.open(tx.paymentUrl, "_blank", "noopener");
        return tx;
    });
    const simulate = useApiMutation(async (success) => {
        await transactionService.simulate(pending.id, success);
        setPending(null);
        detail.reload();
    });
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="đơn thanh toán" onRetry={detail.reload}/>;
    const { order, transactions = [] } = detail.data;
    const paid = order.paymentStatus === "PAID";
    const depositAmount = Number(order.depositAmount) || 0;
    const depositPaid = transactions.some(tx => tx.transactionType === "DEPOSIT" && tx.status === "SUCCESS");
    const confirmed = order.status === "CONFIRMED";
    const blocked = order.status === "PENDING" || order.status === "CANCELLED";
    return <div className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <Link to={`/orders/${order.id}`} className="text-sm font-bold text-[#FC6C26]">← {order.orderCode}</Link>
    <h1 className="text-xl font-bold">Thanh toán tiền thuê</h1>
    <p className="text-sm text-[#666666]">{order.carName} • {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</p>
    <p className="text-2xl font-bold text-[#FC6C26]">{formatMoney(order.totalAmount)}</p>
    {depositAmount > 0 ? <p className="text-sm text-[#292929]">Tiền cọc online: <b>{formatMoney(depositAmount)}</b>{depositPaid ? " • đã đặt cọc" : ""}</p> : null}
    {paid ? <p className="rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]">Đơn này đã thanh toán tiền thuê.</p> : null}
    {depositPaid ? <p className="rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]">Tiền cọc đã thanh toán online.</p> : null}
    {!paid || (depositAmount > 0 && !depositPaid) ? <>
      <label className="text-xs font-semibold text-[#666666]">Phương thức
        <select value={method} onChange={event => setMethod(event.target.value)} className={`${fieldClass} mt-1`}>{Object.entries(paymentMethodLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      </label>
      {start.error ? <p className="text-sm text-[#B91C1C]">{start.error.message}</p> : null}
      <div className="flex flex-wrap gap-2">
        {!paid ? <Primary disabled={start.running || blocked} onClick={() => void start.run("rent")}>{start.running ? "Đang tạo giao dịch…" : "Thanh toán tiền thuê"}</Primary> : null}
        {depositAmount > 0 && !depositPaid ? <button type="button" disabled={start.running || !confirmed} onClick={() => void start.run("deposit")} className="inline-flex items-center justify-center rounded-xl border border-[#FC6C26] px-5 py-2.5 text-sm font-bold text-[#FC6C26] disabled:opacity-60">Đặt cọc online</button> : null}
      </div>
      {order.status === "PENDING" ? <p className="text-xs text-[#666666]">Chờ chủ xe xác nhận đơn trước khi thanh toán hoặc đặt cọc.</p> : null}
      {depositAmount > 0 && !depositPaid && !confirmed && order.status !== "PENDING" ? <p className="text-xs text-[#666666]">Chỉ đặt cọc online khi đơn đang ở trạng thái đã xác nhận.</p> : null}
      {pending ? <div className="rounded-xl border border-[#E9E9E7] p-3 text-sm">
        <p>Giao dịch #{pending.id} ({pending.transactionType === "DEPOSIT" ? "tiền cọc" : "tiền thuê"}) đang chờ. Nếu cổng VNPay sandbox chưa cấu hình, dùng giả lập bên dưới.</p>
        {pending.paymentUrl ? <a href={pending.paymentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-bold text-[#FC6C26]">Mở lại trang VNPay</a> : null}
        {simulate.error ? <p className="mt-2 text-[#B91C1C]">{simulate.error.message}</p> : null}
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={simulate.running} onClick={() => void simulate.run(true)} className="rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white">Giả lập thành công</button>
          <button type="button" disabled={simulate.running} onClick={() => void simulate.run(false)} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444]">Giả lập thất bại</button>
        </div>
      </div> : null}
    </> : null}
  </div>;
}
