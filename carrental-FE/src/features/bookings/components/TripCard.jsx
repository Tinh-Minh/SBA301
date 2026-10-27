import { useState } from "react";
import { Icon } from "@/shared/components/Icon.jsx";
import { PayoutMath } from "@/shared/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/shared/components/owner/StatusBadge.jsx";
import { findHandover, formatRentalPeriod, handoverTypeMeta, isHandoverConfirmed, nextHandoverType, orderStatusMeta } from "@/shared/utils/owner.js";
import { OrderExtraFeesSection } from "@/features/bookings/components/OrderExtraFeesSection.jsx";

export const filters = [
    { id: "all", label: "Tất cả" },
    { id: "upcoming", label: "Sắp giao xe" },
    { id: "ongoing", label: "Đang cho thuê" },
    { id: "done", label: "Hoàn thành" },
];
export function tripGroup(status) {
    if (status === "CONFIRMED")
        return "upcoming";
    if (status === "ONGOING")
        return "ongoing";
    return "done";
}
export function TripCard({ item, busy, error, onCreate, onConfirm }) {
    const { order, car, renter, handovers } = item;
    const period = formatRentalPeriod(order);
    const next = nextHandoverType(handovers);
    const pickup = findHandover(handovers, "PICKUP");
    const returned = findHandover(handovers, "RETURN");
    const draft = next ? findHandover(handovers, next) : undefined;
    const waitingOnRenter = !!draft?.ownerConfirmedAt && !draft.renterConfirmedAt;
    const waitingOnOwner = !!draft?.renterConfirmedAt && !draft.ownerConfirmedAt;
    const [open, setOpen] = useState(false);
    const [odometer, setOdometer] = useState(pickup ? String(pickup.odometerKm) : "");
    const [fuel, setFuel] = useState(pickup ? String(pickup.fuelPercent) : "100");
    const [note, setNote] = useState("");
    const fuelLabel = car.fuelType === "ELECTRIC" ? "Pin" : "Nhiên liệu";
    function submit() {
        if (!next)
            return;
        const odometerKm = Number(odometer);
        const fuelPercent = Number(fuel);
        if (!Number.isInteger(odometerKm) || odometerKm < 0 || !Number.isInteger(fuelPercent) || fuelPercent < 0 || fuelPercent > 100)
            return;
        onCreate({ handoverType: next, odometerKm, fuelPercent, conditionNote: note.trim() || undefined });
        setOpen(false);
    }
    return <article className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="font-mono text-xs font-bold text-brand-accent">{order.orderCode} • {car.licensePlate}</p>
      <StatusBadge meta={orderStatusMeta[order.status]}/>
    </div>
    <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-lg font-bold text-charcoal">{car.brand} {car.model}</h2>
          <p className="text-sm text-muted-gray">{period.range}</p>
          <p className="text-xs text-muted-gray">{period.duration} • {renter.fullName} • {renter.phone}</p>
        </div>
        <p className="text-sm text-muted-gray">{car.pickupAddress}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <HandoverLine type="PICKUP" done={isHandoverConfirmed(pickup)} detail={pickup ? `${pickup.odometerKm.toLocaleString("vi-VN")} km • ${fuelLabel} ${pickup.fuelPercent}%` : "Chưa lập"}/>
          <HandoverLine type="RETURN" done={isHandoverConfirmed(returned)} detail={returned ? `${returned.odometerKm.toLocaleString("vi-VN")} km • ${fuelLabel} ${returned.fuelPercent}%` : "Chưa lập"}/>
        </div>
        {pickup && !returned ? <p className="text-sm text-charcoal">{fuelLabel} lúc nhận: {pickup.fuelPercent}% • ODO {pickup.odometerKm.toLocaleString("vi-VN")} km{pickup.conditionNote ? ` • ${pickup.conditionNote}` : ""}</p> : null}
        {waitingOnRenter ? <p className="text-sm font-semibold text-charcoal">Biên bản {next === "PICKUP" ? "C10-A" : "C10-B"} đã lưu. Đang chờ khách thuê xác nhận.</p> : null}
        {waitingOnOwner ? <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-status-amber-bg p-3">
          <p className="text-sm font-semibold text-charcoal">Khách thuê đã lập biên bản {next === "PICKUP" ? "C10-A" : "C10-B"}: ODO {draft.odometerKm.toLocaleString("vi-VN")} km • {fuelLabel} {draft.fuelPercent}%{draft.conditionNote ? ` • ${draft.conditionNote}` : ""}</p>
          <button type="button" disabled={busy} onClick={() => onConfirm(draft.id)} className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Icon name="task_alt" className="text-[18px]"/>Xác nhận biên bản</button>
          {error ? <p className="text-sm text-on-error-container">{error.message}</p> : null}
        </div> : null}
        {next && !waitingOnRenter && !waitingOnOwner ? <div className="flex flex-col gap-2">
          <button type="button" onClick={() => setOpen(value => !value)} className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover">
            <Icon name="assignment_turned_in" className="text-[18px]"/>
            {next === "PICKUP" ? "Tạo biên bản nhận xe (C10-A)" : "Tạo biên bản trả xe (C10-B)"}
          </button>
          {open ? <div className="grid gap-2 rounded-xl border border-card-border p-3 sm:grid-cols-3">
            <label className="text-xs font-semibold text-charcoal">ODO (km)
              <input inputMode="numeric" value={odometer} onChange={event => setOdometer(event.target.value)} className="mt-1 w-full rounded-lg border border-card-border px-2 py-1.5 font-normal"/>
            </label>
            <label className="text-xs font-semibold text-charcoal">{fuelLabel} %
              <input inputMode="numeric" value={fuel} onChange={event => setFuel(event.target.value)} className="mt-1 w-full rounded-lg border border-card-border px-2 py-1.5 font-normal"/>
            </label>
            <label className="text-xs font-semibold text-charcoal sm:col-span-1">Ghi chú
              <input value={note} onChange={event => setNote(event.target.value)} className="mt-1 w-full rounded-lg border border-card-border px-2 py-1.5 font-normal"/>
            </label>
            <button type="button" disabled={busy} onClick={submit} className="rounded-lg bg-charcoal px-3 py-2 text-sm font-bold text-white disabled:opacity-60 sm:col-span-3">Lưu biên bản, chờ khách xác nhận</button>
          </div> : null}
          {error ? <p className="text-sm text-on-error-container">{error.message}</p> : null}
        </div> : <p className="text-sm font-semibold text-status-success-ink">C10-A và C10-B đã đủ chữ ký hai bên.</p>}
        <div className="mt-2 pt-2 border-t border-gray-100">
          <OrderExtraFeesSection order={order} isOwnerView={true} />
        </div>
      </div>
      <PayoutMath order={order}/>
    </div>
  </article>;
}
function HandoverLine({ type, done, detail }) {
    const meta = handoverTypeMeta[type];
    return <div className={`rounded-xl border px-3 py-2 ${done ? "border-emerald-200 bg-status-green-bg" : "border-card-border bg-bg-light"}`}>
    <p className="text-xs font-bold text-charcoal">{meta.code} • {meta.label}</p>
    <p className="text-xs text-muted-gray">{done ? "Đã ký hai bên" : "Chưa đủ xác nhận"} • {detail}</p>
  </div>;
}
