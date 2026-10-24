import { Link } from "react-router";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { DateTimeField } from "@/components/DateField.jsx";
import { LivePage, LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { formatDateTime, parseQueryDateTime, toInputDateTime } from "@/utils/datetime.js";
import { carImage, carTypeLabels, formatMoney, fuelTypeLabels, rentalTypeLabels, transmissionLabels } from "@/utils/labels.js";
import { slotService } from "@/services/slot.service";

const carTypes = ["", "SEDAN", "SUV", "HATCHBACK", "MPV", "PICKUP", "LUXURY", "OTHER"];

function initialFilters(params) {
    const start = new Date();
    start.setDate(start.getDate() + 1);
    start.setHours(8, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 2);
    end.setHours(20, 0, 0, 0);
    return {
        city: params.get("city") || params.get("location") || "",
        carType: params.get("carType") || "",
        seats: params.get("seats") || "",
        rentalType: params.get("type") || "",
        startTime: parseQueryDateTime(params.get("start")) || toInputDateTime(start),
        endTime: parseQueryDateTime(params.get("end")) || toInputDateTime(end),
        maxPricePerDay: params.get("maxPricePerDay") || "",
    };
}

export default function ExploreCars() {
    return <LivePage width="max-w-7xl">
      <Explorer/>
  </LivePage>;
}

function Explorer() {
    const [params] = useSearchParams();
    const [form, setForm] = useState(() => initialFilters(params));
    const [query, setQuery] = useState(form);
    const [page, setPage] = useState(0);
    const load = useCallback(() => slotService.search({
        city: query.city || undefined,
        carType: query.carType || undefined,
        seats: query.seats ? Number(query.seats) : undefined,
        rentalType: query.rentalType || undefined,
        startTime: query.startTime ? new Date(query.startTime) : undefined,
        endTime: query.endTime ? new Date(query.endTime) : undefined,
        maxPricePerDay: query.maxPricePerDay ? Number(query.maxPricePerDay) : undefined,
        page,
        size: 12,
    }), [query, page]);
    const result = useApiQuery(["vehicles", "search", { query, page }], load, { requiresAuth: false });
    const rows = result.data?.content ?? [];
    const update = (key) => (event) => setForm(current => ({ ...current, [key]: event.target.value }));
    return <div className="flex flex-col gap-5">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">Thuê xe tự lái</p>
      <h1 className="mt-1 text-2xl font-bold text-[#292929]">Khám phá xe đang trống lịch</h1>
      <p className="mt-1 text-sm text-[#666666]">Chỉ hiện các khung giờ chủ xe đang mở. Chọn xe để xem giá và gửi yêu cầu thuê.</p>
    </div>
    <form className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4" onSubmit={event => { event.preventDefault(); if (!event.currentTarget.reportValidity())
        return; setPage(0); setQuery(form); }}>
      <label className="text-xs font-semibold text-[#666666]">Thành phố<input value={form.city} onChange={update("city")} placeholder="Hồ Chí Minh" className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Loại xe
        <select value={form.carType} onChange={update("carType")} className={`${fieldClass} mt-1`}>{carTypes.map(type => <option key={type || "all"} value={type}>{type ? carTypeLabels[type] : "Tất cả"}</option>)}</select>
      </label>
      <label className="text-xs font-semibold text-[#666666]">Số chỗ tối thiểu<input type="number" min="2" max="16" value={form.seats} onChange={update("seats")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Hình thức
        <select value={form.rentalType} onChange={update("rentalType")} className={`${fieldClass} mt-1`}><option value="">Giờ hoặc ngày</option><option value="HOURLY">Theo giờ</option><option value="DAILY">Theo ngày</option></select>
      </label>
      <label className="text-xs font-semibold text-[#666666]">Nhận xe<DateTimeField value={form.startTime} onChange={update("startTime")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Trả xe<DateTimeField value={form.endTime} onChange={update("endTime")} className={`${fieldClass} mt-1`}/></label>
      <label className="text-xs font-semibold text-[#666666]">Giá ngày tối đa (đ)<input type="number" min="0" step="10000" value={form.maxPricePerDay} onChange={update("maxPricePerDay")} className={`${fieldClass} mt-1`}/></label>
      <div className="flex items-end"><Primary type="submit">Tìm xe trống</Primary></div>
    </form>
    <LiveState loading={result.loading && !result.data} error={result.error} empty={result.data && !rows.length} label="xe trống lịch" onRetry={result.reload}/>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(slot => <article key={slot.id} className="overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
        <img src={carImage(slot)} alt={`${slot.brand} ${slot.model}`} className="h-40 w-full object-cover"/>
        <div className="flex flex-col gap-2 p-4">
          <h2 className="font-bold text-[#292929]">{slot.brand} {slot.model}</h2>
          <p className="text-xs text-[#666666]">{carTypeLabels[slot.carType] ?? slot.carType} • {slot.seats} chỗ • {transmissionLabels[slot.transmission] ?? slot.transmission} • {fuelTypeLabels[slot.fuelType] ?? slot.fuelType}</p>
          <p className="text-xs text-[#666666]">{[slot.district, slot.city].filter(Boolean).join(", ")}</p>
          <p className="text-xs text-[#292929]">Trống {formatDateTime(slot.startTime)} → {formatDateTime(slot.endTime)}</p>
          <p className="text-sm font-bold text-[#FC6C26]">{formatMoney(slot.pricePerHour)}/giờ • {formatMoney(slot.pricePerDay)}/ngày</p>
          <p className="text-[11px] text-[#666666]">{rentalTypeLabels[slot.rentalOption] ?? slot.rentalOption} • tối thiểu {slot.minRentalHours} giờ</p>
          <Link to={`/cars/${slot.carId}?slotId=${slot.id}&start=${encodeURIComponent(query.startTime)}&end=${encodeURIComponent(query.endTime)}`} className="mt-1 inline-flex w-fit rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white">Thuê xe này</Link>
        </div>
      </article>)}
    </div>
    {result.data && result.data.totalPages > 1 ? <div className="flex items-center justify-end gap-2 text-sm">
      <button type="button" disabled={page <= 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40">‹ Trước</button>
      <span className="text-[#666666]">Trang {page + 1}/{result.data.totalPages} • {result.data.totalElements} khung giờ</span>
      <button type="button" disabled={page + 1 >= result.data.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40">Sau ›</button>
    </div> : null}
  </div>;
}
