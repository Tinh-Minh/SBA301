import { slotService } from "@/services/slotService.js";
import { useCarSlots } from "@/hooks/useAvailability.js";
import { Link } from "react-router";
import { useState } from "react";
import { DateTimeField } from "@/components/DateField.jsx";
import { Icon } from "@/components/Icon.jsx";
import { Money } from "@/components/owner/Money.jsx";
import { PayoutMath } from "@/components/owner/OwnerScreen.jsx";

import { useApiMutation } from "@/hooks/useApiMutation.js";
import { formatDateTime, toInputDateTime } from "@/utils/datetime.js";
import { formatVnd } from "@/utils/owner.js";
import { ownerRoutes } from "@/routes/paths.js";

export const weekdayLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
export function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
function overlapsDay(item, day) {
    const from = startOfDay(day).getTime();
    const to = from + 86_400_000;
    return Date.parse(item.startTime) < to && Date.parse(item.endTime) > from;
}
export function shortPrice(amount) {
    return `${new Intl.NumberFormat("vi-VN").format(Math.round(amount / 1000))}k`;
}
export function cellFor(day, carId, slots, orders) {
    const order = orders.find(item => item.carId === carId && overlapsDay(item, day));
    const slot = slots.find(item => item.carId === carId && overlapsDay(item, day));
    if (order)
        return { kind: "booked", order, price: slot?.pricePerDay };
    if (slot?.status === "CLOSED")
        return { kind: "locked", slot };
    if (slot?.status === "OPEN")
        return { kind: "open", slot };
    return { kind: "empty" };
}
const slotStatusLabel = { OPEN: "Đang mở", CLOSED: "Tạm đóng", CANCELLED: "Đã hủy" };
const rentalOptionLabel = { BOTH: "Theo giờ & ngày", HOURLY: "Theo giờ", DAILY: "Theo ngày" };
function defaultSlotRange() {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(8, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setHours(20, 0, 0, 0);
    return { startTime: toInputDateTime(start), endTime: toInputDateTime(end) };
}
/** Quản lý khung giờ cho thuê: GET /api/slots/car/{id}, POST /api/slots, PATCH /api/slots/{id}/close|reopen|cancel. */
export function SlotManager({ car, onChanged }) {
    const slots = useCarSlots(car.id);
    const [form, setForm] = useState(() => ({ ...defaultSlotRange(), rentalOption: "BOTH", minRentalHours: "4", customPricePerHour: "", customPricePerDay: "" }));
    const refresh = () => { slots.reload(); onChanged?.(); };
    const create = useApiMutation(() => {
        if (!form.startTime || !form.endTime || new Date(form.endTime) <= new Date(form.startTime))
            return Promise.reject(new Error("Thời gian kết thúc phải sau thời gian bắt đầu."));
        return slotService.create({ carId: car.id, ...form, startTime: new Date(form.startTime), endTime: new Date(form.endTime) });
    }, refresh);
    const act = useApiMutation((kind, id) => slotService[kind](id), refresh);
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));
    const inputClass = "rounded-xl border border-card-border bg-white px-3 py-2 text-sm text-charcoal";
    const notActive = car.status !== "ACTIVE";
    return <section className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-bold text-charcoal">Khung giờ cho thuê • {car.brand} {car.model}</h2>
      <p className="text-sm text-muted-gray">Khách chỉ tìm thấy xe trong các khung giờ đang mở. Để trống giá tùy chỉnh để dùng giá niêm yết ({formatVnd(car.pricePerHour)}/giờ • {formatVnd(car.pricePerDay)}/ngày).</p>
      {notActive ? <p className="text-sm font-semibold text-status-amber-dark">Xe đang ở trạng thái {car.status} — cần được CarDB duyệt (ACTIVE) trước khi mở lịch.</p> : null}
    </div>
    <form className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" onSubmit={event => { event.preventDefault(); if (!event.currentTarget.reportValidity())
        return; void create.run(); }}>
      <label className="flex flex-col gap-1 text-xs font-semibold text-charcoal">Bắt đầu<DateTimeField required value={form.startTime} onChange={update("startTime")} className={inputClass}/></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-charcoal">Kết thúc<DateTimeField required value={form.endTime} onChange={update("endTime")} className={inputClass}/></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-charcoal">Hình thức thuê
        <select value={form.rentalOption} onChange={update("rentalOption")} className={inputClass}>
          {Object.entries(rentalOptionLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-charcoal">Số giờ thuê tối thiểu<input type="number" min="1" value={form.minRentalHours} onChange={update("minRentalHours")} className={inputClass}/></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-charcoal">Giá giờ tùy chỉnh (đ)<input type="number" min="0" step="1000" value={form.customPricePerHour} onChange={update("customPricePerHour")} placeholder={String(car.pricePerHour ?? "")} className={inputClass}/></label>
      <label className="flex flex-col gap-1 text-xs font-semibold text-charcoal">Giá ngày tùy chỉnh (đ)<input type="number" min="0" step="1000" value={form.customPricePerDay} onChange={update("customPricePerDay")} placeholder={String(car.pricePerDay ?? "")} className={inputClass}/></label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
        <button type="submit" disabled={create.running || notActive} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-4 py-2 text-sm font-bold text-white disabled:opacity-60"><Icon name="add" className="text-[18px]"/>{create.running ? "Đang mở…" : "Mở khung giờ"}</button>
        {create.error ? <span className="text-sm text-on-error-container">{create.error.message}</span> : null}
        {act.error ? <span className="text-sm text-on-error-container">{act.error.message}</span> : null}
      </div>
    </form>
    <div className="mt-5 overflow-x-auto">
      {slots.loading && !slots.data ? <p className="text-sm text-muted-gray">Đang tải khung giờ…</p> : null}
      {slots.error ? <p className="text-sm text-on-error-container">{slots.error.message}</p> : null}
      {slots.data && !slots.data.length ? <p className="text-sm text-muted-gray">Chưa có khung giờ nào cho xe này.</p> : null}
      {slots.data?.length ? <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-[11px] uppercase tracking-wide text-muted-gray">
          <tr><th className="py-2">#</th><th>Thời gian</th><th>Hình thức</th><th>Giá</th><th>Trạng thái</th><th className="text-right">Thao tác</th></tr>
        </thead>
        <tbody className="divide-y divide-card-border">
          {slots.data.map(slot => <tr key={slot.id}>
            <td className="py-2 font-mono text-xs">{slot.id}</td>
            <td>{formatDateTime(slot.startTime)} → {formatDateTime(slot.endTime)}</td>
            <td>{rentalOptionLabel[slot.rentalOption] ?? slot.rentalOption} • tối thiểu {slot.minRentalHours}h</td>
            <td>{formatVnd(slot.pricePerHour)}/giờ<br/><span className="text-xs text-muted-gray">{formatVnd(slot.pricePerDay)}/ngày</span></td>
            <td><span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${slot.status === "OPEN" ? "bg-status-green-bg text-status-success-ink" : "bg-badge-gray text-muted-gray"}`}>{slotStatusLabel[slot.status] ?? slot.status}</span></td>
            <td className="space-x-2 text-right">
              {slot.status === "OPEN" ? <button type="button" disabled={act.running} onClick={() => void act.run("close", slot.id)} className="text-xs font-bold text-charcoal">Tạm đóng</button> : null}
              {slot.status === "CLOSED" ? <button type="button" disabled={act.running} onClick={() => void act.run("reopen", slot.id)} className="text-xs font-bold text-brand-accent">Mở lại</button> : null}
              {slot.status !== "CANCELLED" ? <button type="button" disabled={act.running} onClick={() => { if (window.confirm("Hủy khung giờ này?")) void act.run("cancel", slot.id); }} className="text-xs font-bold text-on-error-container">Hủy</button> : null}
            </td>
          </tr>)}
        </tbody>
      </table> : null}
    </div>
  </section>;
}
export function DayPanel({ car, day, info }) {
    const label = new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(day);
    return <aside className="rounded-2xl border border-card-border bg-white p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">Thông tin lịch ngày</p>
    <h2 className="mt-1 text-base font-bold capitalize text-charcoal">{label}</h2>
    <p className="mt-1 text-sm text-muted-gray">{car.brand} {car.model} • {car.licensePlate}</p>
    {info?.kind === "booked" ? <div className="mt-4 flex flex-col gap-3">
      <p className="font-mono text-xs font-bold text-brand-accent">{info.order.orderCode}</p>
      <p className="text-sm text-charcoal">Đơn đã giữ ngày này. Không khóa lịch hoặc đổi giá cho đến khi chuyến kết thúc.</p>
      <PayoutMath order={info.order}/>
      <Link to={ownerRoutes.trips} className="inline-flex items-center gap-1 text-sm font-bold text-brand-accent">Xem chuyến <Icon name="arrow_forward" className="text-[16px]"/></Link>
    </div> : null}
    {info?.kind === "open" ? <div className="mt-4 flex flex-col gap-2 text-sm">
      <p className="font-semibold text-status-success-ink">Đang mở nhận khách</p>
      <p>Giá niêm yết: <Money amount={info.slot.pricePerDay}/> / ngày</p>
      <Link to={ownerRoutes.vehicleEdit(car.id)} className="font-bold text-brand-accent">Đổi giá ở hồ sơ xe</Link>
    </div> : null}
    {info?.kind === "locked" ? <p className="mt-4 text-sm text-muted-gray">Ngày này nằm trong khung lịch đã đóng.</p> : null}
    {info?.kind === "empty" ? <p className="mt-4 text-sm text-muted-gray">Chưa mở lịch cho ngày này.</p> : null}
  </aside>;
}
