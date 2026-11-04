import { Link, useSearchParams } from "react-router";
import { useCallback, useState } from "react";
import { LiveState, Primary, fieldClass } from "@/components/LiveUi.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { carImage, carTypeLabels, formatMoney, fuelTypeLabels, transmissionLabels } from "@/utils/labels.js";
import { carService } from "@/services/vehicleService.js";

const carTypes = ["", "SEDAN", "SUV", "HATCHBACK", "MPV", "PICKUP", "LUXURY", "OTHER"];

function initialFilters(params) {
    return {
        city: params.get("city") || params.get("location") || "",
        carType: params.get("carType") || "",
        brand: params.get("brand") || "",
        seats: params.get("seats") || "",
        minPrice: params.get("minPrice") || "",
        maxPrice: params.get("maxPrice") || "",
    };
}

export function Explorer() {
    const [params] = useSearchParams();
    const [form, setForm] = useState(() => initialFilters(params));
    const [query, setQuery] = useState(form);
    const [page, setPage] = useState(0);

    const load = useCallback(() => carService.search({
        city: query.city || undefined,
        carType: query.carType || undefined,
        brand: query.brand || undefined,
        seats: query.seats ? Number(query.seats) : undefined,
        minPrice: query.minPrice ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
        page,
        size: 12,
    }), [query, page]);

    const result = useApiQuery(["vehicles", "search", { query, page }], load, { requiresAuth: false });
    const rows = result.data?.content ?? [];
    const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

    return (
        <div className="flex flex-col gap-5">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">Sàn rao vặt cho thuê xe</p>
                <h1 className="mt-1 text-2xl font-bold text-[#292929]">Khám phá xe cho thuê tự lái</h1>
                <p className="mt-1 text-sm text-[#666666]">
                    Tìm xe ưng ý, xem thông tin liên hệ và trao đổi trực tiếp với chủ xe.
                </p>
            </div>

            <form
                className="grid gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    if (!event.currentTarget.reportValidity()) return;
                    setPage(0);
                    setQuery(form);
                }}
            >
                <label className="text-xs font-semibold text-[#666666]">
                    Thành phố
                    <input
                        value={form.city}
                        onChange={update("city")}
                        placeholder="Hồ Chí Minh, Hà Nội..."
                        className={`${fieldClass} mt-1`}
                    />
                </label>

                <label className="text-xs font-semibold text-[#666666]">
                    Loại xe
                    <select value={form.carType} onChange={update("carType")} className={`${fieldClass} mt-1`}>
                        {carTypes.map((type) => (
                            <option key={type || "all"} value={type}>
                                {type ? carTypeLabels[type] : "Tất cả các loại xe"}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="text-xs font-semibold text-[#666666]">
                    Số chỗ tối thiểu
                    <input
                        type="number"
                        min="2"
                        max="16"
                        value={form.seats}
                        onChange={update("seats")}
                        placeholder="VD: 4, 7"
                        className={`${fieldClass} mt-1`}
                    />
                </label>

                <label className="text-xs font-semibold text-[#666666]">
                    Hãng xe
                    <input
                        value={form.brand}
                        onChange={update("brand")}
                        placeholder="Toyota, Hyundai, VinFast..."
                        className={`${fieldClass} mt-1`}
                    />
                </label>

                <label className="text-xs font-semibold text-[#666666]">
                    Giá ngày tối đa (đ)
                    <input
                        type="number"
                        min="0"
                        step="50000"
                        value={form.maxPrice}
                        onChange={update("maxPrice")}
                        placeholder="VD: 1000000"
                        className={`${fieldClass} mt-1`}
                    />
                </label>

                <div className="flex items-end sm:col-span-2 lg:col-span-3">
                    <Primary type="submit" className="w-full sm:w-auto">
                        🔍 Tìm kiếm xe
                    </Primary>
                </div>
            </form>

            <LiveState
                loading={result.loading && !result.data}
                error={result.error}
                empty={result.data && !rows.length}
                label="tin đăng xe"
                onRetry={result.reload}
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((car) => {
                    const dayPrice = car.rentalPricePerDay || car.pricePerDay || 0;
                    return (
                        <article key={car.id} className="overflow-hidden rounded-2xl border border-[#E9E9E7] bg-white shadow-sm flex flex-col justify-between">
                            <div>
                                <img src={carImage(car)} alt={`${car.brand} ${car.model}`} className="h-44 w-full object-cover" />
                                <div className="flex flex-col gap-2 p-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="font-bold text-[#292929] text-base">{car.brand} {car.model}</h2>
                                        <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#4B5563]">
                                            {carTypeLabels[car.carType] ?? car.carType}
                                        </span>
                                    </div>
                                    <p className="text-xs text-[#666666]">
                                        {car.seats} chỗ • {transmissionLabels[car.transmission] ?? car.transmission} • {fuelTypeLabels[car.fuelType] ?? car.fuelType}
                                    </p>
                                    <p className="text-xs text-[#666666]">
                                        📍 {[car.district, car.city].filter(Boolean).join(", ")}
                                    </p>
                                    <div className="mt-1 flex items-baseline gap-1">
                                        <span className="text-base font-extrabold text-[#FC6C26]">{formatMoney(dayPrice)}</span>
                                        <span className="text-xs text-[#666666]">/ngày</span>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 pt-0">
                                <Link
                                    to={`/cars/${car.id}`}
                                    className="inline-flex w-full justify-center rounded-xl bg-[#FC6C26] py-2.5 text-sm font-bold text-white hover:bg-[#e05615] transition"
                                >
                                    Xem chi tiết & Liên hệ
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>

            {result.data && result.data.totalPages > 1 ? (
                <div className="flex items-center justify-end gap-2 text-sm mt-4">
                    <button
                        type="button"
                        disabled={page <= 0}
                        onClick={() => setPage(page - 1)}
                        className="rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40"
                    >
                        ‹ Trước
                    </button>
                    <span className="text-[#666666]">
                        Trang {page + 1}/{result.data.totalPages} • {result.data.totalElements} tin đăng
                    </span>
                    <button
                        type="button"
                        disabled={page + 1 >= result.data.totalPages}
                        onClick={() => setPage(page + 1)}
                        className="rounded-lg border border-[#E9E9E7] bg-white px-3 py-1.5 font-bold disabled:opacity-40"
                    >
                        Sau ›
                    </button>
                </div>
            ) : null}
        </div>
    );
}
