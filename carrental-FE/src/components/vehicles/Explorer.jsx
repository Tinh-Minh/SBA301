import { Link, useSearchParams } from "react-router";
import { useCallback, useMemo, useState } from "react";
import { LiveState, fieldClass } from "@/components/LiveUi.jsx";
import { Icon } from "@/components/Icon.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carImage, carTypeLabels, formatMoney, fuelTypeLabels, transmissionLabels } from "@/utils/labels.js";
import { carService } from "@/services/vehicleService.js";
import { defaultWindow, durationLabel, estimate, splitDuration, toApiTime, windowError } from "@/utils/rental.js";

const carTypes = ["", "SEDAN", "SUV", "HATCHBACK", "MPV", "PICKUP", "LUXURY", "OTHER"];
const sorts = [
    { id: "createdAt:DESC", label: "Mới đăng" },
    { id: "rentalPricePerDay:ASC", label: "Giá thấp → cao" },
    { id: "rentalPricePerDay:DESC", label: "Giá cao → thấp" },
    { id: "seats:DESC", label: "Nhiều chỗ nhất" },
];
const seatOptions = [["", "Bất kỳ"], ["4", "≥ 4 chỗ"], ["5", "≥ 5 chỗ"], ["7", "≥ 7 chỗ"], ["9", "≥ 9 chỗ"]];

function fromParams(params) {
    const fallback = defaultWindow();
    return {
        city: params.get("city") || params.get("location") || "",
        pickupAt: (params.get("pickupAt") || "").slice(0, 16),
        returnAt: (params.get("returnAt") || "").slice(0, 16),
        carType: params.get("carType") || "",
        brand: params.get("brand") || "",
        seats: params.get("seats") || "",
        transmission: params.get("transmission") || "",
        fuelType: params.get("fuelType") || "",
        minPrice: params.get("minPrice") || "",
        maxPrice: params.get("maxPrice") || "",
        sort: params.get("sort") || sorts[0].id,
        _fallback: fallback,
    };
}

export function Explorer() {
    const [params, setParams] = useSearchParams();
    const initial = useMemo(() => fromParams(params), []); // eslint-disable-line react-hooks/exhaustive-deps
    const [form, setForm] = useState(initial);
    // Ngày nhận/trả là tuỳ chọn: chưa chọn thì vẫn liệt kê mọi xe đang cho thuê.
    const hasWindow = q => Boolean(q?.pickupAt || q?.returnAt);
    const [query, setQuery] = useState(() => (hasWindow(initial) && windowError(initial.pickupAt, initial.returnAt) ? { ...initial, pickupAt: "", returnAt: "" } : initial));
    const [page, setPage] = useState(0);
    const [error, setError] = useState("");
    const [moreFilters, setMoreFilters] = useState(false);

    const load = useCallback(() => {
        const [sortBy, direction] = query.sort.split(":");
        return carService.search({
            city: query.city || undefined, carType: query.carType || undefined, brand: query.brand || undefined,
            seats: query.seats ? Number(query.seats) : undefined,
            minPrice: query.minPrice ? Number(query.minPrice) : undefined,
            maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
            transmission: query.transmission || undefined, fuelType: query.fuelType || undefined,
            pickupAt: query.pickupAt ? toApiTime(query.pickupAt) : undefined, returnAt: query.returnAt ? toApiTime(query.returnAt) : undefined,
            sortBy, direction, page, size: 12,
        });
    }, [query, page]);
    const result = useApiQuery(["vehicles", "search", { query, page }], load, { requiresAuth: false, enabled: Boolean(query) });
    const rows = result.data?.content ?? [];
    const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

    function submit(next = form) {
        const message = hasWindow(next) ? windowError(next.pickupAt, next.returnAt) : null;
        setError(message ?? "");
        if (message) return;
        if (next.minPrice && next.maxPrice && Number(next.minPrice) > Number(next.maxPrice)) {
            setError("Giá tối thiểu không được lớn hơn giá tối đa.");
            return;
        }
        setPage(0);
        setQuery(next);
        const search = new URLSearchParams();
        Object.entries(next).forEach(([k, v]) => { if (v && !k.startsWith("_")) search.set(k, v); });
        setParams(search, { replace: true });
    }

    const timed = Boolean(query?.pickupAt && query?.returnAt);
    const duration = timed ? splitDuration(query.pickupAt, query.returnAt) : null;
    const tripQuery = timed ? `?pickupAt=${encodeURIComponent(query.pickupAt)}&returnAt=${encodeURIComponent(query.returnAt)}` : "";

    return <div className="flex flex-col gap-5">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">Thuê xe tự lái</p>
      <h1 className="mt-1 text-2xl font-bold text-[#292929]">Tìm xe trống lịch theo thời gian của bạn</h1>
      <p className="mt-1 text-sm text-[#666666]">Xem mọi xe đang cho thuê. Chọn giờ nhận và trả xe để lọc xe còn trống lịch và tính sẵn tổng tiền theo ngày + giờ.</p>
    </div>

    <form noValidate onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex flex-col gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="text-xs font-semibold text-[#666666]">Địa điểm nhận xe
          <input value={form.city} onChange={set("city")} placeholder="TP. Hồ Chí Minh, Hà Nội..." className={`${fieldClass} mt-1`}/>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Nhận xe <span className="font-normal text-[#8A887F]">(tuỳ chọn)</span>
          <input type="datetime-local" value={form.pickupAt} onChange={set("pickupAt")} className={`${fieldClass} mt-1`} aria-invalid={Boolean(error && !form.pickupAt)}/>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Trả xe <span className="font-normal text-[#8A887F]">(tuỳ chọn)</span>
          <input type="datetime-local" value={form.returnAt} min={form.pickupAt || undefined} onChange={set("returnAt")} className={`${fieldClass} mt-1`} aria-invalid={Boolean(error && !form.returnAt)}/>
        </label>
        <button type="submit" className="inline-flex items-center justify-center gap-1.5 self-end rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]"><Icon name="search" className="text-[18px]"/>Tìm xe</button>
      </div>
      {!form.pickupAt && !form.returnAt ? <button type="button" onClick={() => setForm(f => ({ ...f, ...f._fallback }))} className="self-start text-xs font-bold text-[#FC6C26]">Gợi ý: nhận 9:00 ngày mai, trả 9:00 ngày kia</button> : null}
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold text-[#666666]">Loại xe
          <select value={form.carType} onChange={set("carType")} className={`${fieldClass} mt-1`}>{carTypes.map(t => <option key={t || "all"} value={t}>{t ? carTypeLabels[t] : "Tất cả"}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Số chỗ
          <select value={form.seats} onChange={set("seats")} className={`${fieldClass} mt-1`}>{seatOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Sắp xếp
          <select value={form.sort} onChange={(e) => { const next = { ...form, sort: e.target.value }; setForm(next); if (query) submit(next); }} className={`${fieldClass} mt-1`}>{sorts.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        </label>
        <button type="button" onClick={() => setMoreFilters(v => !v)} className="rounded-xl border border-[#E9E9E7] px-3 py-2 text-xs font-bold text-[#292929]">{moreFilters ? "Ẩn bớt bộ lọc" : "Thêm bộ lọc"}</button>
      </div>
      {moreFilters ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-semibold text-[#666666]">Hãng xe<input value={form.brand} onChange={set("brand")} placeholder="Toyota, VinFast..." className={`${fieldClass} mt-1`}/></label>
        <label className="text-xs font-semibold text-[#666666]">Hộp số
          <select value={form.transmission} onChange={set("transmission")} className={`${fieldClass} mt-1`}><option value="">Bất kỳ</option><option value="AUTOMATIC">Số tự động</option><option value="MANUAL">Số sàn</option></select>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Nhiên liệu
          <select value={form.fuelType} onChange={set("fuelType")} className={`${fieldClass} mt-1`}><option value="">Bất kỳ</option>{Object.entries(fuelTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="text-xs font-semibold text-[#666666]">Giá/ngày từ (đ)<input type="number" min="0" step="50000" value={form.minPrice} onChange={set("minPrice")} className={`${fieldClass} mt-1`}/></label>
        <label className="text-xs font-semibold text-[#666666]">Giá/ngày đến (đ)<input type="number" min="0" step="50000" value={form.maxPrice} onChange={set("maxPrice")} className={`${fieldClass} mt-1`}/></label>
      </div> : null}
      {error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}
    </form>

    {!query ? <div className="rounded-2xl border border-dashed border-[#FDBA8C] bg-[#FFF7F2] p-8 text-center">
      <Icon name="event" className="text-[36px] text-[#FC6C26]"/>
      <p className="mt-2 font-bold text-[#292929]">Chọn thời gian nhận và trả xe để xem xe còn trống</p>
      <p className="mt-1 text-sm text-[#666666]">Giá thuê được quy về số ngày (24 giờ) và số giờ lẻ, giờ lẻ tính 1/10 giá ngày và không vượt giá 1 ngày.</p>
    </div> : <>
      <p className="text-sm text-[#666666]">{result.data ? <><b className="text-[#292929]">{result.data.totalElements}</b> {timed ? "xe trống lịch" : "xe đang cho thuê"}</> : "Đang tìm…"}{timed ? <> • thời gian thuê <b className="text-[#292929]">{durationLabel(duration.days, duration.hours)}</b></> : " • chọn ngày nhận/trả để lọc xe còn trống và xem tổng tiền"}</p>
      <LiveState loading={result.loading && !result.data} error={result.error} empty={result.data && !rows.length} label="xe trống lịch phù hợp" onRetry={result.reload}/>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(car => {
            const day = car.rentalPricePerDay || car.pricePerDay || 0;
            return <article key={car.id} className="flex flex-col overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm">
              <Link to={`/cars/${car.id}${tripQuery}`}><img src={carImage(car)} alt={`${car.brand} ${car.model}`} className="h-44 w-full object-cover"/></Link>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-bold text-[#292929]">{car.brand} {car.model}</h2>
                  <span className="shrink-0 rounded bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#4B5563]">{carTypeLabels[car.carType] ?? car.carType}</span>
                </div>
                <p className="text-xs text-[#666666]">{car.seats} chỗ • {transmissionLabels[car.transmission]} • {fuelTypeLabels[car.fuelType]}</p>
                <p className="flex items-center gap-1 text-xs text-[#666666]"><Icon name="location_on" className="text-[14px]"/>{[car.district, car.city].filter(Boolean).join(", ")}</p>
                <div className="mt-auto flex items-end justify-between gap-2 border-t border-[#F1F1EF] pt-3">
                  {timed ? <div><span className="text-xs text-[#666666]">{formatMoney(day)}/ngày • {formatMoney(car.pricePerHour)}/giờ</span>
                    <p className="text-lg font-extrabold text-[#FC6C26]">≈ {formatMoney(estimate(day, query.pickupAt, query.returnAt))}</p>
                    <span className="text-[11px] text-[#666666]">cho {durationLabel(duration.days, duration.hours)}, chưa gồm cọc</span></div>
                  : <div><p className="text-lg font-extrabold text-[#FC6C26]">{formatMoney(day)}<span className="text-xs font-semibold text-[#666666]">/ngày</span></p>
                    <span className="text-[11px] text-[#666666]">{formatMoney(car.pricePerHour)}/giờ lẻ</span></div>}
                  <Link to={`/cars/${car.id}${tripQuery}`} className="rounded-xl bg-[#FC6C26] px-4 py-2 text-sm font-bold text-white hover:bg-[#e05615]">Chọn xe</Link>
                </div>
              </div>
            </article>;
        })}
      </div>
      {result.data && result.data.totalPages > 1 ? <div className="flex items-center justify-end gap-2 text-sm">
        <button type="button" disabled={page <= 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40">‹ Trước</button>
        <span className="text-[#666666]">Trang {page + 1}/{result.data.totalPages}</span>
        <button type="button" disabled={page + 1 >= result.data.totalPages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40">Sau ›</button>
      </div> : null}
    </>}
  </div>;
}
