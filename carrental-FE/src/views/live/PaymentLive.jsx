"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { LivePage, LiveState, Primary, fieldClass } from "@/components/live-ui";
import { useAsyncAction, useAsyncResource } from "@/hooks/use-async-resource";
import { formatDateTime } from "@/lib/datetime";
import { formatMoney, paymentMethodLabels, paymentStatusLabels } from "@/lib/labels";
import { rentalService } from "@/services/order.service";
import { transactionService } from "@/services/customer-extra.service";

export default function PaymentLive() {
    const orderId = useSearchParams().get("orderId");
    return <LivePage width="max-w-xl">
    <RequireAuth title="Đăng nhập để thanh toán">
      {orderId ? <Pay orderId={orderId}/> : <OrderSelector />}
    </RequireAuth>
  </LivePage>;
}

function OrderSelector() {
    const load = useCallback(() => rentalService.listMine(), []);
    const list = useAsyncResource(load);

    if (list.loading && !list.data) {
        return <LiveState loading label="danh sách đơn thuê" />;
    }
    if (list.error) {
        return <LiveState error={list.error} label="danh sách đơn thuê" onRetry={list.reload} />;
    }

    const orders = list.data ?? [];
    const awaitingPayment = orders.filter(
        (o) => o.paymentStatus !== "PAID" && (o.status === "CONFIRMED" || o.status === "ONGOING")
    );
    const pendingConfirmation = orders.filter((o) => o.status === "PENDING");

    if (awaitingPayment.length > 0) {
        return (
            <div className="flex flex-col gap-4">
                <div className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold text-[#292929]">Chọn đơn thuê để thanh toán</h2>
                    <p className="mt-1 text-sm text-[#666666]">
                        Bạn có {awaitingPayment.length} đơn đã được chủ xe xác nhận và đang chờ thanh toán:
                    </p>
                    <div className="mt-4 flex flex-col gap-3">
                        {awaitingPayment.map((order) => (
                            <div
                                key={order.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#E9E9E7] p-4 hover:border-[#FC6C26] transition-colors"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</span>
                                        <span className="rounded-md bg-[#DBEAFE] px-2 py-0.5 text-xs font-semibold text-[#2563EB]">
                                            Đã xác nhận
                                        </span>
                                    </div>
                                    <h3 className="mt-1 font-bold text-[#292929]">{order.carName}</h3>
                                    <p className="text-sm font-semibold text-[#FC6C26]">{formatMoney(order.totalAmount)}</p>
                                    {order.expiresAt && (
                                        <p className="mt-0.5 text-xs text-[#DC2626]">
                                            Hạn thanh toán: {formatDateTime(order.expiresAt)}
                                        </p>
                                    )}
                                </div>
                                <Link
                                    href={`/payment?orderId=${order.id}`}
                                    className="inline-flex items-center justify-center rounded-xl bg-[#FC6C26] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e05b19] transition-colors whitespace-nowrap shadow-sm"
                                >
                                    Thanh toán ngay →
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#E9E9E7] bg-white p-8 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF2EB] text-[#FC6C26]">
                <span className="material-symbols-outlined text-[32px]">receipt_long</span>
            </div>
            <div>
                <h2 className="text-lg font-bold text-[#292929]">Chưa có đơn hàng nào cần thanh toán</h2>
                <p className="mt-1.5 max-w-md text-sm text-[#666666]">
                    {pendingConfirmation.length > 0
                        ? `Bạn có ${pendingConfirmation.length} đơn đang chờ chủ xe duyệt. Sau khi chủ xe xác nhận, bạn có thể thanh toán tại đây.`
                        : "Để thanh toán tiền thuê, vui lòng vào Chuyến xe của tôi và chọn đơn hàng đã được chủ xe xác nhận."}
                </p>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
                <Link
                    href="/my-trips"
                    className="rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e05b19] transition-colors shadow-sm"
                >
                    Chuyến xe của tôi
                </Link>
                <Link
                    href="/explore"
                    className="rounded-xl border border-[#E9E9E7] bg-white px-5 py-2.5 text-sm font-bold text-[#292929] hover:bg-[#F7F7F5] transition-colors"
                >
                    Khám phá xe
                </Link>
            </div>
        </div>
    );
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
    {order.expiresAt && !paid && order.status === "CONFIRMED" ? (
      <div className="rounded-xl border border-[#FED7AA] bg-[#FFF7ED] p-3 text-xs text-[#9A3412] flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-[#EA580C]">timer</span>
        <span>Hạn thanh toán: <strong>{formatDateTime(order.expiresAt)}</strong>. Sau thời gian này, hệ thống sẽ tự động hủy đơn để giải phóng xe.</span>
      </div>
    ) : null}
    {order.status === "CANCELLED" ? (
      <p className="rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">
        Đơn này đã bị hủy {order.cancelReason ? `(${order.cancelReason})` : ""}. Không thể thanh toán.
      </p>
    ) : null}
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
