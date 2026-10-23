"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { LivePage, LiveState, Primary, fieldClass } from "@/components/live-ui";
import { useAsyncAction, useAsyncResource } from "@/hooks/use-async-resource";
import { formatMoney, paymentMethodLabels, paymentStatusLabels } from "@/lib/labels";
import { rentalService } from "@/services/order.service";
import { transactionService } from "@/services/customer-extra.service";

export default function PaymentLive() {
    const orderId = useSearchParams().get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để thanh toán">
      {orderId ? <Pay orderId={orderId}/> : <p className="text-sm">Thiếu mã đơn. Mở thanh toán từ <Link href="/my-trips" className="font-bold text-[#FC6C26]">chuyến xe của tôi</Link>.</p>}
    </RequireAuth>
  </LivePage>;
}

function Pay({ orderId }) {
    const load = useCallback(async () => {
        const [order, transactions] = await Promise.all([rentalService.getById(orderId), transactionService.listByOrder(orderId)]);
        return { order, transactions };
    }, [orderId]);
    const detail = useAsyncResource(load, orderId);
    const [method, setMethod] = useState("VNPAY");
    const [pending, setPending] = useState(null);
    const pay = useAsyncAction(async () => {
        const tx = await transactionService.createPayment({ orderId, amount: Number(detail.data.order.totalAmount), method });
        setPending(tx);
        if (tx.paymentUrl)
            window.open(tx.paymentUrl, "_blank", "noopener");
        return tx;
    });
    const simulate = useAsyncAction(async (success) => {
        await transactionService.simulate(pending.id, success);
        setPending(null);
        detail.reload();
    });
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="đơn thanh toán" onRetry={detail.reload}/>;
    const { order } = detail.data;
    const paid = order.paymentStatus === "PAID";
    return <div className="flex flex-col gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <Link href={`/orders/${order.id}`} className="text-sm font-bold text-[#FC6C26]">← {order.orderCode}</Link>
    <h1 className="text-xl font-bold">Thanh toán tiền thuê</h1>
    <p className="text-sm text-[#666666]">{order.carName} • {paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</p>
    <p className="text-2xl font-bold text-[#FC6C26]">{formatMoney(order.totalAmount)}</p>
    {paid ? <p className="rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]">Đơn này đã thanh toán.</p> : <>
      <label className="text-xs font-semibold text-[#666666]">Phương thức
        <select value={method} onChange={event => setMethod(event.target.value)} className={`${fieldClass} mt-1`}>{Object.entries(paymentMethodLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
      </label>
      {pay.error ? <p className="text-sm text-[#B91C1C]">{pay.error.message}</p> : null}
      <Primary disabled={pay.running || order.status === "PENDING" || order.status === "CANCELLED"} onClick={() => void pay.run()}>{pay.running ? "Đang tạo giao dịch…" : "Thanh toán qua cổng"}</Primary>
      {order.status === "PENDING" ? <p className="text-xs text-[#666666]">Chờ chủ xe xác nhận đơn trước khi thanh toán.</p> : null}
      {pending ? <div className="rounded-xl border border-[#E9E9E7] p-3 text-sm">
        <p>Giao dịch #{pending.id} đang chờ. Nếu cổng VNPay sandbox chưa cấu hình, dùng giả lập bên dưới.</p>
        {pending.paymentUrl ? <a href={pending.paymentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex font-bold text-[#FC6C26]">Mở lại trang VNPay</a> : null}
        {simulate.error ? <p className="mt-2 text-[#B91C1C]">{simulate.error.message}</p> : null}
        <div className="mt-3 flex gap-2">
          <button type="button" disabled={simulate.running} onClick={() => void simulate.run(true)} className="rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white">Giả lập thành công</button>
          <button type="button" disabled={simulate.running} onClick={() => void simulate.run(false)} className="rounded-lg border border-[#EF4444] px-3 py-1.5 text-xs font-bold text-[#EF4444]">Giả lập thất bại</button>
        </div>
      </div> : null}
    </>}
  </div>;
}
