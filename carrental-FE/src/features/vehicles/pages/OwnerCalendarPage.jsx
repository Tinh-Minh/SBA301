import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Icon } from "@/shared/components/Icon.jsx";
import { OwnerCrumb, OwnerHeading, OwnerState } from "@/shared/components/owner/OwnerScreen.jsx";
import { useOwnerCalendar } from "@/shared/hooks/useOwnerCalendar.js";
import { formatVnd } from "@/shared/utils/owner.js";
import { ownerRoutes } from "@/app/routes/owner.routes.js";
import { weekdayLabels, startOfDay, shortPrice, cellFor, SlotManager, DayPanel } from "@/features/vehicles/components/SlotManager.jsx";

export default function OwnerCalendar() {
    const today = new Date();
    const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const { data, loading, error, reload } = useOwnerCalendar(cursor.year, cursor.month);
    const cars = data?.cars ?? [];
    const [carId, setCarId] = useState(null);
    const selectedCarId = carId ?? cars.find(car => car.status === "ACTIVE")?.id ?? cars[0]?.id ?? null;
    const [selectedDay, setSelectedDay] = useState(today.getDate());
    const grid = useMemo(() => {
        const first = new Date(cursor.year, cursor.month, 1);
        const lead = (first.getDay() + 6) % 7;
        const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
        const cells = [];
        for (let index = 0; index < lead; index += 1) {
            const date = new Date(cursor.year, cursor.month, index - lead + 1);
            cells.push({ date, inMonth: false });
        }
        for (let day = 1; day <= daysInMonth; day += 1)
            cells.push({ date: new Date(cursor.year, cursor.month, day), inMonth: true });
        while (cells.length % 7 !== 0)
            cells.push(null);
        return cells;
    }, [cursor]);
    const car = cars.find(item => item.id === selectedCarId);
    const dayDate = new Date(cursor.year, cursor.month, selectedDay);
    const dayInfo = car && data ? cellFor(dayDate, car.id, data.slots, data.orders) : null;
    const monthOrders = data && car ? data.orders.filter(order => order.carId === car.id) : [];
    const bookedDays = new Set(monthOrders.flatMap(order => {
        const days = [];
        const cursorDay = startOfDay(new Date(order.startTime));
        const end = startOfDay(new Date(order.endTime));
        while (cursorDay < end && cursorDay.getMonth() === cursor.month && cursorDay.getFullYear() === cursor.year) {
            days.push(cursorDay.getDate());
            cursorDay.setDate(cursorDay.getDate() + 1);
        }
        return days;
    }));
    const openDays = data && car ? grid.filter(cell => cell?.inMonth && cellFor(cell.date, car.id, data.slots, data.orders).kind === "open").length : 0;
    const fill = openDays + bookedDays.size === 0 ? 0 : Math.round((bookedDays.size / (openDays + bookedDays.size)) * 1000) / 10;
    function shift(delta) {
        const next = new Date(cursor.year, cursor.month + delta, 1);
        setCursor({ year: next.getFullYear(), month: next.getMonth() });
        setSelectedDay(1);
    }
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb current="Lịch cho thuê" parent={{ href: ownerRoutes.dashboard, label: "Bảng điều khiển" }}/>
      <OwnerHeading title="Lịch cho thuê xe" description="Khung ngày đang mở, ngày đã có khách và ngày bị khóa theo từng xe."/>
    </div>
    <OwnerState loading={loading && !data} error={error} label="lịch"/>
    {data && car ? <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-2xl border border-card-border bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-w-0 flex-col gap-1 text-xs font-bold uppercase tracking-wide text-muted-gray">
            Xe đang xem
            <select value={car.id} onChange={event => setCarId(Number(event.target.value))} className="rounded-xl border border-card-border bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-charcoal">
              {cars.map(item => <option key={item.id} value={item.id}>{item.brand} {item.model} • {item.licensePlate}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Tháng trước" onClick={() => shift(-1)} className="flex size-9 items-center justify-center rounded-xl border border-card-border"><Icon name="chevron_left" className="text-[20px]"/></button>
            <span className="min-w-36 text-center text-sm font-bold text-charcoal">Tháng {cursor.month + 1} / {cursor.year}</span>
            <button type="button" aria-label="Tháng sau" onClick={() => shift(1)} className="flex size-9 items-center justify-center rounded-xl border border-card-border"><Icon name="chevron_right" className="text-[20px]"/></button>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-muted-gray">
          {weekdayLabels.map(label => <span key={label}>{label}</span>)}
        </div>
        <div className="mt-1.5 grid grid-cols-7 gap-1.5">
          {grid.map((cell, index) => {
                if (!cell)
                    return <span key={`pad-${index}`}/>;
                const info = cell.inMonth ? cellFor(cell.date, car.id, data.slots, data.orders) : null;
                const selected = cell.inMonth && cell.date.getDate() === selectedDay;
                const tone = !cell.inMonth ? "text-muted-gray/40" : info?.kind === "booked" ? "border-brand-accent bg-accent-soft text-charcoal" : info?.kind === "locked" ? "border-card-border bg-badge-gray text-muted-gray" : info?.kind === "open" ? "border-emerald-200 bg-status-green-bg text-charcoal" : "border-card-border bg-white text-muted-gray";
                return <button key={cell.date.toISOString()} type="button" disabled={!cell.inMonth} onClick={() => setSelectedDay(cell.date.getDate())} className={`flex min-h-16 flex-col items-start rounded-xl border p-1.5 text-left sm:min-h-20 sm:p-2 ${tone} ${selected ? "ring-2 ring-brand-accent" : ""}`}>
              <span className="text-xs font-bold">{cell.date.getDate()}</span>
              {info?.kind === "open" ? <span className="mt-auto text-[10px] font-semibold text-status-success-ink">{shortPrice(info.slot.pricePerDay)}</span> : null}
              {info?.kind === "booked" ? <span className="mt-auto truncate text-[10px] font-bold text-brand-accent">#{info.order.id}</span> : null}
              {info?.kind === "locked" ? <span className="mt-auto text-[10px] font-semibold">Khóa</span> : null}
            </button>;
            })}
        </div>
        <p className="mt-4 text-xs text-muted-gray">
          Tỷ lệ lấp đầy tháng: <span className="font-bold text-charcoal">{fill}%</span> • {bookedDays.size} ngày đã có khách
          {monthOrders.length ? <> • doanh thu thuê {formatVnd(monthOrders.reduce((sum, order) => sum + order.rentalAmount, 0))}</> : null}
        </p>
      </section>

      <DayPanel car={car} day={dayDate} info={dayInfo}/>
    </div> : null}
    {data && car ? <SlotManager key={car.id} car={car} onChanged={reload}/> : null}
    {data && !cars.length ? <div className="rounded-2xl border border-card-border bg-white p-6 text-sm text-muted-gray">Bạn chưa có xe nào. <Link to={ownerRoutes.vehicleNew} className="font-bold text-brand-accent">Đăng xe đầu tiên</Link> để mở lịch cho thuê.</div> : null}
  </div>;
}
