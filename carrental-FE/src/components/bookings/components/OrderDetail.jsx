import { DetailItem } from "@/components/DetailItem.jsx";
import { rentalService } from "@/services/bookingService.js";
import { useBookingDetail } from "@/hooks/useBookings.js";
import { Link } from "react-router";
import { useState } from "react";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { LivePage, LiveState, Pill, Primary, fieldClass } from "@/components/LiveUi.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDateTime } from "@/utils/datetime.js";
import { findHandover, isHandoverConfirmed, nextHandoverType } from "@/utils/owner.js";
import { formatMoney, handoverTypeLabels, orderStatusLabels, orderStatusTone, paymentStatusLabels, rentalTypeLabels } from "@/utils/labels.js";
import { useHandoverActions } from "@/hooks/useHandovers.js";
import { OrderExtraFeesSection } from "@/components/bookings/components/OrderExtraFeesSection.jsx";

export function OrderDetail({ orderId, justCreated = false }) {
    return <LivePage width="max-w-3xl">
    <RequireAuth title="Đăng nhập để xem đơn thuê">
      <Detail orderId={orderId} justCreated={justCreated}/>
    </RequireAuth>
  </LivePage>;
}

function Detail({ orderId, justCreated }) {
    const detail = useBookingDetail(orderId);
    const reload = detail.reload;
    const cancel = useApiMutation((reason) => rentalService.cancel(orderId, reason), reload);
    const { createHandover, confirmHandover } = useHandoverActions(reload, orderId);
    if (!detail.data)
        return <LiveState loading={detail.loading} error={detail.error} label="đơn thuê" onRetry={reload}/>;
    const { order, handovers, logs } = detail.data;
    const next = nextHandoverType(handovers);
    const draft = next ? findHandover(handovers, next) : null;
    const waitingForMe = draft && draft.ownerConfirmedAt && !draft.renterConfirmedAt;
    const waitingForOwner = draft && draft.renterConfirmedAt && !draft.ownerConfirmedAt;
    const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";
    return <div className="flex flex-col gap-4">
    <Link to="/my-trips" className="text-sm font-bold text-[#FC6C26]">← Chuyến xe của tôi</Link>
    {justCreated ? <p className="rounded-xl bg-[#ECFDF5] p-3 text-sm text-[#047857]">Đã gửi yêu cầu. Chủ xe có 24 giờ để xác nhận.</p> : null}
    <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-mono text-sm font-bold text-[#FC6C26]">{order.orderCode}</h1>
        <span className="flex gap-2">
          <Pill className={orderStatusTone[order.status]}>{orderStatusLabels[order.status] ?? order.status}</Pill>
          <Pill className="bg-[#F3F4F6] text-[#374151]">{paymentStatusLabels[order.paymentStatus] ?? order.paymentStatus}</Pill>
        </span>
      </div>
      <h2 className="mt-2 text-xl font-bold">{order.carName}</h2>
      <p className="text-sm text-[#666666]">{order.licensePlate} • chủ xe {order.ownerName}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <DetailItem term="Nhận xe" value={formatDateTime(order.startTime)}/>
        <DetailItem term="Trả xe" value={formatDateTime(order.endTime)}/>
        <DetailItem term="Hình thức" value={`${rentalTypeLabels[order.rentalType] ?? order.rentalType} × ${order.quantity}`}/>
        <DetailItem term="Tiền thuê" value={formatMoney(order.rentalAmount)}/>
        <DetailItem term="Giảm giá" value={`${formatMoney(order.discountAmount)}${order.voucherCode ? ` (${order.voucherCode})` : ""}`}/>
        <DetailItem term="Tổng thanh toán" value={formatMoney(order.totalAmount)}/>
        <DetailItem term="Tiền cọc" value={formatMoney(order.depositAmount)}/>
        {order.expiresAt && order.status === "PENDING" ? <DetailItem term="Hết hạn duyệt" value={formatDateTime(order.expiresAt)}/> : null}
      </dl>
      {order.note ? <p className="mt-3 rounded-xl bg-[#F7F7F5] p-3 text-sm">Ghi chú: {order.note}</p> : null}
      {order.cancelReason ? <p className="mt-3 rounded-xl bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">Lý do: {order.cancelReason}</p> : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {order.paymentStatus === "UNPAID" && (order.status === "CONFIRMED" || order.status === "ONGOING") ? <Link to={`/payment?orderId=${order.id}`} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Thanh toán</Link> : null}
        {order.status === "COMPLETED" ? <Link to={`/reviews?orderId=${order.id}`} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold">Đánh giá</Link> : null}
        {order.status === "ONGOING" || order.status === "COMPLETED" ? <Link to={`/disputes?orderId=${order.id}`} className="rounded-xl border border-[#E9E9E7] px-4 py-2 text-sm font-bold">Khiếu nại</Link> : null}
      </div>
      {canCancel ? <CancelBox busy={cancel.running} error={cancel.error} onCancel={reason => void cancel.run(reason)}/> : null}
    </section>

    <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <h2 className="font-bold">Biên bản bàn giao</h2>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {["PICKUP", "RETURN"].map(type => {
            const item = findHandover(handovers, type);
            return <li key={type} className="rounded-xl bg-[#F7F7F5] p-3">
          <b>{handoverTypeLabels[type]}</b> • {item ? (isHandoverConfirmed(item) ? "Hai bên đã xác nhận" : "Đang chờ bên còn lại") : "Chưa lập"}
          {item ? <span className="block text-xs text-[#666666]">ODO {item.odometerKm.toLocaleString("vi-VN")} km • {item.fuelPercent}% {item.conditionNote ? `• ${item.conditionNote}` : ""}</span> : null}
        </li>;
        })}
      </ul>
      {waitingForMe ? <div className="mt-3 rounded-xl border border-amber-200 bg-[#FFFBEB] p-3 text-sm">
        <p>Chủ xe đã lập biên bản {handoverTypeLabels[next]}. Kiểm tra số km và mức nhiên liệu rồi xác nhận.</p>
        <button type="button" disabled={confirmHandover.running} onClick={() => void confirmHandover.run(draft.id)} className="mt-2 rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Xác nhận biên bản</button>
      </div> : null}
      {waitingForOwner ? <p className="mt-3 text-sm text-[#666666]">Đã gửi biên bản {handoverTypeLabels[next]}. Đang chờ chủ xe xác nhận.</p> : null}
      {next && !draft ? <HandoverForm type={next} busy={createHandover.running} error={createHandover.error} onCreate={input => void createHandover.run(input)}/> : null}
      {confirmHandover.error ? <p className="mt-2 text-sm text-[#B91C1C]">{confirmHandover.error.message}</p> : null}
      <p className="mt-3 text-xs text-[#666666]">Biên bản nhận xe chỉ lập được từ 60 phút trước giờ nhận. Nếu bị từ chối, hãy kiểm tra lại thời điểm.</p>
    </section>

    <OrderExtraFeesSection order={order} onReloadParent={reload}/>

    <section className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <h2 className="font-bold">Nhật ký</h2>
      <ol className="mt-3 flex flex-col gap-2 border-l border-[#E9E9E7] pl-3 text-sm">
        {logs.map(log => <li key={log.id}><b>{orderStatusLabels[log.toStatus] ?? log.action}</b> • {formatDateTime(log.createdAt)}{log.actorName ? ` • ${log.actorName}` : ""}{log.note ? ` • ${log.note}` : ""}</li>)}
        {!logs.length ? <li className="text-[#666666]">Chưa có nhật ký.</li> : null}
      </ol>
    </section>
  </div>;
}

function CancelBox({ busy, error, onCancel }) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    if (!open)
        return <button type="button" onClick={() => setOpen(true)} className="mt-4 text-sm font-bold text-[#B91C1C]">Hủy đơn thuê</button>;
    return <form className="mt-4 grid gap-2" onSubmit={event => { event.preventDefault(); onCancel(reason.trim()); }}>
    <textarea value={reason} onChange={event => setReason(event.target.value)} rows={2} placeholder="Lý do hủy (không bắt buộc với khách thuê)" className={fieldClass}/>
    {error ? <p className="text-sm text-[#B91C1C]">{error.message}</p> : null}
    <div className="flex gap-2"><Primary disabled={busy} type="submit">Xác nhận hủy</Primary><button type="button" onClick={() => setOpen(false)} className="text-sm font-bold">Đóng</button></div>
  </form>;
}

function HandoverForm({ type, busy, error, onCreate }) {
    const [odometerKm, setOdo] = useState("");
    const [fuelPercent, setFuel] = useState("100");
    const [conditionNote, setNote] = useState("");
    const [imageUrl, setImage] = useState("");
    return <form className="mt-4 grid gap-2" onSubmit={event => {
        event.preventDefault();
        onCreate({ handoverType: type, odometerKm, fuelPercent, conditionNote, images: imageUrl.trim() ? [{ imageUrl: imageUrl.trim() }] : [] });
    }}>
    <h3 className="text-sm font-bold">Lập biên bản {handoverTypeLabels[type]}</h3>
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="text-xs font-semibold text-[#666666]">Số km ODO<input required type="number" min="0" value={odometerKm} onChange={event => setOdo(event.target.value)} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Nhiên liệu / pin %<input required type="number" min="0" max="100" value={fuelPercent} onChange={event => setFuel(event.target.value)} className={`${fieldClass} mt-1`}/></label>
    </div>
    <input value={conditionNote} onChange={event => setNote(event.target.value)} placeholder="Tình trạng xe" className={fieldClass}/>
    <input value={imageUrl} onChange={event => setImage(event.target.value)} placeholder="Đường dẫn ảnh (https://...), không bắt buộc" className={fieldClass}/>
    {error ? <p className="text-sm text-[#B91C1C]">{error.message}</p> : null}
    <Primary type="submit" disabled={busy}>{busy ? "Đang gửi…" : "Gửi biên bản"}</Primary>
  </form>;
}
