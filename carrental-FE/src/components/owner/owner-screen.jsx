import Link from "next/link";
import { calculatePayout, formatPercent, formatVnd } from "@/lib/owner/finance";
import { ownerRoutes } from "@/lib/owner/routes";
import { Money } from "./money";
export function OwnerCrumb({ current, parent }) {
    return <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-muted-gray">
    <Link href={ownerRoutes.dashboard} className="transition-colors hover:text-charcoal">Cho thuê xe</Link>
    <span>/</span>
    {parent ? <>
      <Link href={parent.href} className="transition-colors hover:text-charcoal">{parent.label}</Link>
      <span>/</span>
    </> : null}
    <span className="font-semibold text-charcoal">{current}</span>
  </nav>;
}
export function OwnerHeading({ title, description, actions }) {
    return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
    <div className="min-w-0">
      <h1 className="text-2xl font-bold leading-snug tracking-tight text-charcoal sm:text-[28px]">{title}</h1>
      <p className="mt-0.5 max-w-2xl text-sm text-muted-gray">{description}</p>
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </div>;
}
export function OwnerState({ loading, error, label }) {
    if (loading)
        return <div className="rounded-2xl border border-card-border bg-white p-10 text-center text-sm text-muted-gray">Đang tải {label}…</div>;
    if (error)
        return <div className="rounded-2xl border border-red-200 bg-error-container p-10 text-center text-sm text-on-error-container">{error.message}</div>;
    return null;
}
export function FilterBar({ value, options, onChange }) {
    return <div className="flex gap-2 overflow-x-auto pb-1">
    {options.map(option => <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors ${value === option.id ? "border-brand-accent bg-brand-accent text-white" : "border-card-border bg-white text-charcoal hover:border-gray-300"}`}>
      {option.label}
    </button>)}
  </div>;
}
export function PayoutMath({ order }) {
    const payout = calculatePayout(order);
    const unit = order.rentalType === "DAILY" ? "ngày" : "giờ";
    return <div className="rounded-xl border border-card-border bg-bg-light p-4">
    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">Bảng tính tài chính</p>
    <div className="mt-3 flex flex-col gap-1.5 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-gray">{formatVnd(order.unitPrice)} × {order.quantity} {unit}</span>
        <Money amount={order.rentalAmount}/>
      </div>
      {order.discountAmount > 0 ? <div className="flex items-center justify-between gap-3 text-xs text-muted-gray">
        <span>Voucher CarDB, không trừ thực nhận</span>
        <Money amount={order.discountAmount} sign="-"/>
      </div> : null}
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-gray">Phí dịch vụ ({formatPercent(order.commissionRate)})</span>
        <Money amount={payout.platformFee} sign="-" className="text-status-amber-dark"/>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-card-border pt-2 font-bold text-charcoal">
        <span>Thực nhận chủ xe</span>
        <Money amount={payout.netAmount} className="text-base text-status-success-ink"/>
      </div>
    </div>
    <p className="mt-3 text-xs leading-relaxed text-muted-gray">Tiền cọc {formatVnd(order.depositAmount)} chủ xe tự thu khi ký biên bản C10-A, không đi qua escrow.</p>
  </div>;
}
