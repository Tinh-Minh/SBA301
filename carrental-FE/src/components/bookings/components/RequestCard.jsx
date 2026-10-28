import { Icon } from "@/components/Icon.jsx";
import { CountdownBadge } from "@/components/owner/CountdownBadge.jsx";
import { PayoutMath } from "@/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { canRespondToOrder, formatRentalPeriod, kycStatusMeta, orderStatusMeta } from "@/shared/utils/owner.js";

export const filters = [
    { id: "all", label: "Tất cả" },
    { id: "PENDING", label: "Chờ xác nhận" },
    { id: "CONFIRMED", label: "Đã duyệt" },
    { id: "REJECTED", label: "Từ chối" },
    { id: "EXPIRED", label: "Hết hạn" },
];
function initials(name) {
    return name.split(" ").slice(-2).map(part => part[0] ?? "").join("").toUpperCase();
}
export function RequestCard({ item, rejecting, reason, busy, error, onReason, onStartReject, onCancelReject, onApprove, onReject }) {
    const { order, car, renter } = item;
    const period = formatRentalPeriod(order);
    const open = canRespondToOrder(order);
    const kyc = kycStatusMeta[renter.kycStatus];
    return <article className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-mono text-xs font-bold text-brand-accent">{order.orderCode} • {car.licensePlate}</p>
      <div className="flex items-center gap-2">
        {order.status === "PENDING" ? <CountdownBadge deadline={order.expiresAt}/> : <StatusBadge meta={orderStatusMeta[order.status]}/>}
      </div>
    </div>
    <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex min-w-0 flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold text-charcoal">{car.brand} {car.model}</h2>
          <p className="text-sm text-muted-gray">{period.range}</p>
          <p className="text-xs text-muted-gray">{period.duration}</p>
        </div>
        <p className="text-sm text-muted-gray">{car.pickupAddress}</p>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-bg-light text-xs font-bold text-charcoal">{initials(renter.fullName)}</span>
          <div>
            <p className="font-semibold text-charcoal">{renter.fullName}</p>
            <p className="text-xs text-status-success-ink">{kyc.label} • {renter.phone}</p>
          </div>
        </div>
        {order.paymentStatus === "PAID" ? <p className="text-xs font-semibold text-status-success-ink">Khách đã thanh toán tiền thuê vào escrow.</p> : <p className="text-xs text-muted-gray">Tiền thuê chưa vào escrow.</p>}
      </div>
      <PayoutMath order={order}/>
    </div>
    {open ? <div className="mt-4 flex flex-col gap-3 border-t border-card-border pt-4">
      {rejecting ? <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-charcoal">Lý do từ chối
          <textarea value={reason} onChange={event => onReason(event.target.value)} rows={2} className="mt-1 w-full rounded-xl border border-card-border px-3 py-2 font-normal outline-none focus:border-brand-accent" placeholder="Xe bận lịch hoặc không đáp ứng yêu cầu giao xe"/>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={onCancelReject} className="rounded-xl border border-card-border px-4 py-2 text-sm font-bold">Hủy</button>
          <button type="button" disabled={busy || !reason.trim()} onClick={onReject} className="rounded-xl bg-charcoal px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Xác nhận từ chối</button>
        </div>
      </div> : <div className="flex flex-wrap justify-end gap-2">
        <button type="button" disabled={busy} onClick={onStartReject} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-4 py-2 text-sm font-bold text-charcoal">
          <Icon name="close" className="text-[16px]"/> Từ chối
        </button>
        <button type="button" disabled={busy} onClick={onApprove} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">
          <Icon name="check" className="text-[16px]"/> Chấp nhận đơn này
        </button>
      </div>}
      {error ? <p className="text-sm text-on-error-container">{error.message}</p> : null}
    </div> : null}
  </article>;
}
