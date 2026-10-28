import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { carSubtitle, formatActivityTime, formatRentalPeriod, formatVnd, kycStatusMeta } from "@/shared/utils/owner.js";

import { ownerRoutes } from "@/app/routes/paths.js";


const activityTone = {
    warning: "bg-status-amber-bg border-amber-200 text-status-amber-dark",
    success: "bg-status-green-bg border-emerald-200 text-emerald-accent",
    payment: "border-blue-200 bg-blue-light text-brand-accent",
};
export function StatCard({ label, value, hint, pill, icon, iconClass }) {
    return <div className="flex h-full items-start justify-between gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm transition-colors hover:border-gray-300">
    <div className="flex min-w-0 flex-1 flex-col">
      <span className="truncate text-[11px] font-bold uppercase tracking-wide text-muted-gray">{label}</span>
      <div className="mt-2 flex h-6 items-center">
        {pill ? <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${pill.className}`}>{pill.text}</span> : null}
      </div>
      <span className="text-[26px] font-bold leading-none tracking-tight text-charcoal">{value}</span>
      <span className="mt-1.5 min-h-10 text-xs leading-snug text-muted-gray">{hint}</span>
    </div>
    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl border ${iconClass}`}>
      <Icon name={icon} className="text-[22px]"/>
    </div>
  </div>;
}
export function PendingRow({ item }) {
    const { order, car, renter } = item;
    const period = formatRentalPeriod(order);
    const kyc = kycStatusMeta[renter.kycStatus];
    return <tr className="transition-colors hover:bg-gray-50/70">
    <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-semibold text-brand-accent">{order.orderCode}</td>
    <td className="px-4 py-3.5">
      <div className="flex flex-col">
        <span className="whitespace-nowrap font-bold text-charcoal">{car.brand} {car.model}</span>
        <span className="text-xs text-muted-gray">{car.licensePlate}</span>
      </div>
    </td>
    <td className="px-4 py-3.5">
      <div className="flex flex-col">
        <span className="whitespace-nowrap font-semibold text-charcoal">{renter.fullName}</span>
        <span className="whitespace-nowrap text-xs font-medium text-status-success-ink">GPLX B2 • {kyc.label}</span>
      </div>
    </td>
    <td className="px-4 py-3.5">
      <div className="flex flex-col">
        <span className="whitespace-nowrap font-medium text-charcoal">{period.range}</span>
        <span className="text-xs text-muted-gray">{period.duration}</span>
      </div>
    </td>
    <td className="px-4 py-3.5">
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-status-amber-bg px-2.5 py-1 text-xs font-bold text-status-amber-dark">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-status-amber"/>
        Chờ xác nhận
      </span>
    </td>
    <td className="px-4 py-3.5 text-right">
      <Link to={ownerRoutes.requests} className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-card-border bg-bg-light px-3 py-1.5 text-xs font-bold text-charcoal shadow-sm transition-all hover:border-orange-200 hover:bg-accent-soft hover:text-brand-accent">
        Xem yêu cầu
        <Icon name="arrow_forward" className="text-[14px]"/>
      </Link>
    </td>
  </tr>;
}
export function VehicleCard({ item }) {
    const { car, openSlots } = item;
    const approved = car.status === "ACTIVE" || car.status === "INACTIVE";
    const title = `${car.brand} ${car.model}`;
    return <article className="group flex flex-col overflow-hidden rounded-2xl border border-card-border bg-white shadow-sm transition-all hover:border-gray-300 hover:shadow-md">
    <div className="relative h-44 w-full overflow-hidden">
      <img src={car.primaryImageUrl ?? "/images/cardb-e5cfa07014e754d6.webp"} alt={title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async"/>
      <div className="absolute left-3 top-3">
        {approved ? <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-emerald-200/50 bg-white/80 px-2.5 py-1 text-xs font-semibold text-emerald-accent shadow-sm backdrop-blur-md">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-emerald-accent"/>
          ĐÃ DUYỆT (APPROVED)
        </span> : <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-200/50 bg-white/80 px-2.5 py-1 text-xs font-semibold text-status-amber-dark shadow-sm backdrop-blur-md">
          <span aria-hidden="true" className="size-1.5 animate-pulse rounded-full bg-status-amber"/>
          CHỜ DUYỆT (PENDING)
        </span>}
      </div>
      <div className="absolute bottom-2 right-2 rounded-md bg-charcoal/85 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-white backdrop-blur-sm">{car.licensePlate}</div>
    </div>
    <div className="flex flex-1 flex-col justify-between gap-3 p-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-base font-bold text-charcoal">{title}</h3>
        <span className="text-xs text-muted-gray">{carSubtitle(car)}</span>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-card-border bg-bg-light px-3 py-2">
        <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-gray">
          <Icon name={openSlots > 0 ? "event_available" : "schedule"} className={`text-[16px] ${openSlots > 0 ? "text-emerald-accent" : ""}`}/>
          <span className="whitespace-nowrap">{openSlots > 0 ? `${openSlots} khung lịch mở` : "Chưa mở lịch"}</span>
        </div>
        <div className="flex shrink-0 items-baseline gap-1 whitespace-nowrap">
          <span className={`text-sm font-bold ${approved ? "text-charcoal" : "text-muted-gray"}`}>{formatVnd(car.pricePerDay)}</span>
          <span className="text-xs text-muted-gray">/ngày</span>
        </div>
      </div>
      {approved ? <Link to={ownerRoutes.vehicleEdit(car.id)} className="block w-full rounded-xl bg-brand-accent py-2.5 text-center text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-hover">
        Quản lý xe →
      </Link> : <Link to={ownerRoutes.vehicleEdit(car.id)} className="block w-full rounded-xl border-2 border-brand-accent py-2 px-4 text-center text-xs font-semibold text-brand-accent transition-all hover:bg-accent-soft">
        Cập nhật hồ sơ →
      </Link>}
    </div>
  </article>;
}
export function ActivityRow({ item }) {
    return <div className="flex items-center justify-between gap-3 border-b border-card-border py-2 last:border-b-0">
    <div className="flex min-w-0 items-center gap-3">
      <div className={`flex size-7 shrink-0 items-center justify-center rounded-full border shadow-sm ${activityTone[item.tone]}`}>
        <Icon name={item.icon} className="text-[16px]"/>
      </div>
      <div className="min-w-0 text-sm font-semibold text-charcoal">
        {item.title}
        {item.highlight ? <> <span className="font-bold text-status-success-ink">{item.highlight}</span></> : null}
        {item.subtitle ? <> — <span className="font-normal text-muted-gray">{item.subtitle}</span></> : null}
        {item.orderCode ? <> — <span className="font-mono text-xs text-brand-accent">{item.orderCode}</span></> : null}
      </div>
    </div>
    <span className="whitespace-nowrap text-xs font-medium text-muted-gray">{formatActivityTime(item.at)}</span>
  </div>;
}
export function QuickAction({ href, label }) {
    return <Link to={href} className="group flex items-center justify-between rounded-xl border border-card-border bg-bg-light px-4 py-2.5 text-sm font-medium text-charcoal transition-all hover:border-brand-accent hover:bg-white hover:shadow-sm">
    <span>{label}</span>
    <Icon name="chevron_right" className="text-[18px] text-muted-gray transition-all group-hover:translate-x-0.5 group-hover:text-brand-accent"/>
  </Link>;
}
