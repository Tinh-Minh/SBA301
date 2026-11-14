import { Link, useSearchParams } from "react-router";
import { useCallback, useMemo, useState } from "react";
import { LiveState, fieldClass } from "@/components/LiveUi.jsx";
import { LocationPicker } from "@/components/location/LocationPicker.jsx";
import { carPoint, deliveryDistanceKm, deliveryFee, locationPoint, useDeliveryLocation } from "@/utils/delivery.js";
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
    const where = locationPoint(useDeliveryLocation());
    const rows = useMemo(() => {
        const list = (result.data?.content ?? []).map(car => ({ car, km: deliveryDistanceKm(carPoint(car), where) }));
        if (where) list.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
        return list;
    }, [result.data, where?.lat, where?.lng]); // eslint-disable-line react-hooks/exhaustive-deps
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

    return <div className="flex flex-col gap-6">
    {/* Editorial Hero Header */}
    <header className="editorial-hero-banner p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <span className="editorial-kicker">01 / Khám phá đội xe tự lái</span>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-[#25251F] sm:text-3xl lg:text-4xl">
            Tìm xe trống lịch theo thời gian của bạn
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#5C584F]">
            Xem mọi xe đang cho thuê. Chọn giờ nhận và trả xe để lọc xe còn trống lịch và tính sẵn tổng tiền theo ngày + giờ.
          </p>
        </div>
        {result.data ? (
          <div className="flex shrink-0 items-center gap-3 self-start rounded-2xl border border-[#D6D3CB] bg-white/85 px-4 py-3 backdrop-blur-sm lg:self-end">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#25251F] text-[#FC6C26]">
              <Icon name="directions_car" className="text-[20px]"/>
            </span>
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-wider text-[#6C6C61]">Đội xe sẵn sàng</p>
              <p className="text-lg font-extrabold leading-tight text-[#25251F]">{result.data.totalElements} chiếc</p>
            </div>
          </div>
        ) : null}
      </div>
    </header>

    {/* Search & Filter Dock (Editorial Search Form) */}
    <form noValidate onSubmit={(event) => { event.preventDefault(); submit(); }} className="flex flex-col gap-4 rounded-[24px] border border-[#E4E2D8] bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ECEAE2] pb-3">
        <div className="flex items-center gap-2">
          <Icon name="tune" className="text-[20px] text-[#FC6C26]"/>
          <span className="text-sm font-bold text-[#25251F]">Lịch trình &amp; Điểm nhận xe</span>
        </div>
        {!form.pickupAt && !form.returnAt ? (
          <button type="button" onClick={() => setForm(f => ({ ...f, ...f._fallback }))} className="inline-flex items-center gap-1 rounded-full bg-[#FFF3EB] px-3 py-1 text-xs font-bold text-[#C84910] transition hover:bg-[#FC6C26] hover:text-white">
            <Icon name="schedule" className="text-[14px]"/>Gợi ý: nhận 9:00 ngày mai, trả 9:00 ngày kia
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-1.5 text-xs font-bold text-[#5C584F]">Địa điểm nhận xe <span className="font-normal text-[#868379]">(để tính phí giao xe; vẫn xem được xe ở xa)</span></p>
        <LocationPicker compact/>
      </div>

      <div className="grid gap-3.5 md:grid-cols-[1fr_1fr_auto]">
        <label className="text-xs font-bold text-[#5C584F]">Nhận xe <span className="font-normal text-[#868379]">(tuỳ chọn)</span>
          <input type="datetime-local" value={form.pickupAt} onChange={set("pickupAt")} className={`${fieldClass} mt-1.5`} aria-invalid={Boolean(error && !form.pickupAt)}/>
        </label>
        <label className="text-xs font-bold text-[#5C584F]">Trả xe <span className="font-normal text-[#868379]">(tuỳ chọn)</span>
          <input type="datetime-local" value={form.returnAt} min={form.pickupAt || undefined} onChange={set("returnAt")} className={`${fieldClass} mt-1.5`} aria-invalid={Boolean(error && !form.returnAt)}/>
        </label>
        <button type="submit" className="inline-flex h-[42px] items-center justify-center gap-2 self-end rounded-xl bg-[#FC6C26] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#25251F]">
          <Icon name="search" className="text-[18px]"/>Tìm xe
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-3 border-t border-[#ECEAE2] pt-3.5">
        <label className="min-w-[140px] flex-1 sm:flex-none text-xs font-bold text-[#5C584F]">Loại xe
          <select value={form.carType} onChange={set("carType")} className={`${fieldClass} mt-1`}>{carTypes.map(t => <option key={t || "all"} value={t}>{t ? carTypeLabels[t] : "Tất cả"}</option>)}</select>
        </label>
        <label className="min-w-[130px] flex-1 sm:flex-none text-xs font-bold text-[#5C584F]">Số chỗ
          <select value={form.seats} onChange={set("seats")} className={`${fieldClass} mt-1`}>{seatOptions.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </label>
        <label className="min-w-[160px] flex-1 sm:flex-none text-xs font-bold text-[#5C584F]">Sắp xếp
          <select value={form.sort} onChange={(e) => { const next = { ...form, sort: e.target.value }; setForm(next); if (query) submit(next); }} className={`${fieldClass} mt-1`}>{sorts.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
        </label>
        <button type="button" onClick={() => setMoreFilters(v => !v)} className="inline-flex h-[42px] items-center gap-1.5 rounded-xl border border-[#D2CFC3] bg-[#F8F7F3] px-4 text-xs font-bold text-[#25251F] transition hover:border-[#FC6C26]">
          <Icon name={moreFilters ? "expand_less" : "filter_list"} className="text-[16px]"/>
          {moreFilters ? "Ẩn bớt bộ lọc" : "Thêm bộ lọc"}
        </button>
      </div>

      {moreFilters ? <div className="grid gap-3 rounded-2xl bg-[#FAF9F5] p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-xs font-bold text-[#5C584F]">Hãng xe<input value={form.brand} onChange={set("brand")} placeholder="Toyota, VinFast..." className={`${fieldClass} mt-1 bg-white`}/></label>
        <label className="text-xs font-bold text-[#5C584F]">Hộp số
          <select value={form.transmission} onChange={set("transmission")} className={`${fieldClass} mt-1 bg-white`}><option value="">Bất kỳ</option><option value="AUTOMATIC">Số tự động</option><option value="MANUAL">Số sàn</option></select>
        </label>
        <label className="text-xs font-bold text-[#5C584F]">Nhiên liệu
          <select value={form.fuelType} onChange={set("fuelType")} className={`${fieldClass} mt-1 bg-white`}><option value="">Bất kỳ</option>{Object.entries(fuelTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </label>
        <label className="text-xs font-bold text-[#5C584F]">Giá/ngày từ (đ)<input type="number" min="0" step="50000" value={form.minPrice} onChange={set("minPrice")} className={`${fieldClass} mt-1 bg-white`}/></label>
        <label className="text-xs font-bold text-[#5C584F]">Giá/ngày đến (đ)<input type="number" min="0" step="50000" value={form.maxPrice} onChange={set("maxPrice")} className={`${fieldClass} mt-1 bg-white`}/></label>
      </div> : null}
      {error ? <p role="alert" className="rounded-xl bg-[#FEF2F2] px-3.5 py-2.5 text-sm font-medium text-[#B91C1C]">{error}</p> : null}
    </form>

    {!query ? <div className="rounded-2xl border border-dashed border-[#FDBA8C] bg-[#FFF7F2] p-8 text-center">
      <Icon name="event" className="text-[36px] text-[#FC6C26]"/>
      <p className="mt-2 font-bold text-[#25251F]">Chọn thời gian nhận và trả xe để xem xe còn trống</p>
      <p className="mt-1 text-sm text-[#5C584F]">Giá thuê được quy về số ngày (24 giờ) và số giờ lẻ, giờ lẻ tính 1/10 giá ngày và không vượt giá 1 ngày.</p>
    </div> : <>
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <p className="text-sm text-[#5C584F]">
          {result.data ? <><b className="font-extrabold text-[#25251F]">{result.data.totalElements}</b> {timed ? "xe trống lịch" : "xe đang cho thuê"}</> : "Đang tìm…"}
          {timed ? <> • thời gian thuê <b className="font-bold text-[#25251F]">{durationLabel(duration.days, duration.hours)}</b></> : " • chọn ngày nhận/trả để lọc xe còn trống và xem tổng tiền"}
        </p>
      </div>

      <LiveState loading={result.loading && !result.data} error={result.error} empty={result.data && !rows.length} label="xe trống lịch phù hợp" onRetry={result.reload}/>

      {/* Showroom Vehicle Grid */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {rows.map(({ car, km }) => {
            const day = car.rentalPricePerDay || car.pricePerDay || 0;
            const fee = deliveryFee(km);
            return <article key={car.id} data-vehicle-card className="group flex flex-col overflow-hidden rounded-[22px] border border-[#E4E2D8] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#C8C4B6] hover:shadow-lg">
              <Link to={`/cars/${car.id}${tripQuery}`} className="relative block aspect-[16/10] w-full overflow-hidden bg-[#F3F3EE]">
                <img data-car-image src={carImage(car)} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover"/>
                <span className="absolute left-3 top-3 rounded-full bg-[#25251F]/85 px-3 py-1 text-[11px] font-bold tracking-wide text-[#FAF8F2] backdrop-blur-md">
                  {carTypeLabels[car.carType] ?? car.carType}
                </span>
                {km != null ? (
                  <span className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm backdrop-blur-md ${fee ? "bg-amber-50/95 text-[#B45309]" : "bg-emerald-50/95 text-[#047857]"}`}>
                    ~{km.toLocaleString("vi-VN")} km · {fee ? `giao ${formatMoney(fee)}` : "giao miễn phí"}
                  </span>
                ) : null}
              </Link>

              <div className="flex flex-1 flex-col gap-3 p-5">
                <div>
                  <h2 className="text-lg font-extrabold leading-snug text-[#25251F] transition-colors group-hover:text-[#FC6C26]">
                    {car.brand} {car.model}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[#6C6C61]">
                    <Icon name="location_on" className="text-[15px] text-[#FC6C26]"/>
                    {[car.district, car.city].filter(Boolean).join(", ")}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-lg bg-[#F3F2EC] px-2.5 py-1 text-xs font-semibold text-[#5C584F]">{car.seats} chỗ</span>
                  <span className="rounded-lg bg-[#F3F2EC] px-2.5 py-1 text-xs font-semibold text-[#5C584F]">{transmissionLabels[car.transmission]}</span>
                  <span className="rounded-lg bg-[#F3F2EC] px-2.5 py-1 text-xs font-semibold text-[#5C584F]">{fuelTypeLabels[car.fuelType]}</span>
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#ECEAE2] pt-3.5">
                  {timed ? (
                    <div>
                      <span className="block text-[11px] font-medium text-[#6C6C61]">{formatMoney(day)}/ngày • {formatMoney(car.pricePerHour)}/giờ</span>
                      <p className="text-xl font-extrabold tabular-nums text-[#D95018]">≈ {formatMoney(estimate(day, query.pickupAt, query.returnAt))}</p>
                      <span className="text-[11px] text-[#6C6C61]">cho {durationLabel(duration.days, duration.hours)}, chưa gồm cọc</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xl font-extrabold tabular-nums text-[#D95018]">
                        {formatMoney(day)}<span className="text-xs font-semibold text-[#6C6C61]">/ngày</span>
                      </p>
                      <span className="text-[11px] text-[#6C6C61]">{formatMoney(car.pricePerHour)}/giờ lẻ</span>
                    </div>
                  )}
                  <Link to={`/cars/${car.id}${tripQuery}`} className="inline-flex items-center gap-1 rounded-full bg-[#FC6C26] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#25251F]">
                    Chọn xe <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </article>;
        })}
      </div>

      {result.data && result.data.totalPages > 1 ? <div className="flex items-center justify-end gap-2 pt-2 text-sm">
        <button type="button" disabled={page <= 0} onClick={() => setPage(page - 1)} className="rounded-xl border border-[#D6D3CB] bg-white px-4 py-2 font-bold text-[#25251F] disabled:opacity-40">‹ Trước</button>
        <span className="px-2 font-semibold text-[#5C584F]">Trang {page + 1}/{result.data.totalPages}</span>
        <button type="button" disabled={page + 1 >= result.data.totalPages} onClick={() => setPage(page + 1)} className="rounded-xl border border-[#D6D3CB] bg-white px-4 py-2 font-bold text-[#25251F] disabled:opacity-40">Sau ›</button>
      </div> : null}
    </>}
  </div>;
}
