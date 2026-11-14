import { Link } from "react-router";
import { calculatePayout, formatPercent, formatVnd } from "@/utils/owner.js";
import { Money } from "@/components/owner/Money.jsx";

export function OwnerCrumb({ current, parent, homeHref }) {
    return <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-[#6C6C61]">
    <Link to={homeHref} className="transition-colors hover:text-[#FC6C26]">Kênh chủ xe</Link>
    <span>/</span>
    {parent ? <>
      <Link to={parent.href} className="transition-colors hover:text-[#FC6C26]">{parent.label}</Link>
      <span>/</span>
    </> : null}
    <span className="font-bold text-[#25251F]">{current}</span>
  </nav>;
}

export function OwnerHeading({ title, description, actions }) {
    return <div className="editorial-hero-banner flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-end sm:p-6">
    <div className="min-w-0">
      <span className="editorial-kicker">Quản lý đội xe &amp; Vận hành</span>
      <h1 className="mt-1.5 text-2xl font-extrabold leading-snug tracking-tight text-[#25251F] sm:text-[28px]">{title}</h1>
      {description ? <p className="mt-1 max-w-2xl text-sm text-[#5C584F]">{description}</p> : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
  </div>;
}

export function OwnerState({ loading, error, label }) {
    if (loading)
        return <div className="rounded-2xl border border-[#E4E2D8] bg-white p-10 text-center text-sm font-medium text-[#5C584F]">Đang tải {label}…</div>;
    if (error)
        return <div className="rounded-2xl border border-red-200 bg-error-container p-10 text-center text-sm text-on-error-container">{error.message}</div>;
    return null;
}

export function FilterBar({ value, options, onChange }) {
    return <div className="flex flex-wrap gap-2 pb-1">
    {options.map(option => <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${value === option.id ? "border-[#25251F] bg-[#25251F] text-white shadow-sm" : "border-[#D6D3CB] bg-white text-[#25251F] hover:border-[#FC6C26]"}`}>
      {option.label}
    </button>)}
  </div>;
}

export function PayoutMath({ order }) {
    const payout = calculatePayout(order);
    const unit = order.rentalType === "DAILY" ? "ngày" : "giờ";
    return <div className="rounded-xl border border-[#E4E2D8] bg-[#FAF9F5] p-4">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#6C6C61]">Bảng tính tài chính</p>
    <div className="mt-3 flex flex-col gap-1.5 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#5C584F]">{formatVnd(order.unitPrice)} × {order.quantity} {unit}</span>
        <Money amount={order.rentalAmount}/>
      </div>
      {order.discountAmount > 0 ? <div className="flex items-center justify-between gap-3 text-xs text-[#6C6C61]">
        <span>Voucher CarDB, không trừ thực nhận</span>
        <Money amount={order.discountAmount} sign="-"/>
      </div> : null}
      <div className="flex items-center justify-between gap-3">
        <span className="text-[#5C584F]">Phí dịch vụ ({formatPercent(order.commissionRate)})</span>
        <Money amount={payout.platformFee} sign="-" className="text-status-amber-dark"/>
      </div>
      <div className="mt-1 flex items-center justify-between gap-3 border-t border-[#E4E2D8] pt-2 font-bold text-[#25251F]">
        <span>Thực nhận chủ xe</span>
        <Money amount={payout.netAmount} className="text-base text-status-success-ink"/>
      </div>
    </div>
    <p className="mt-3 text-xs leading-relaxed text-[#6C6C61]">Tiền cọc {formatVnd(order.depositAmount)} chủ xe tự thu khi ký biên bản C10-A, không đi qua escrow.</p>
  </div>;
}
