

const filters = [
    { id: "all", label: "Tất cả" },
    { id: "approved", label: "Đã duyệt" },
    { id: "pending", label: "Chờ duyệt" },
    { id: "paused", label: "Tạm ẩn" },
];
export function matches(car, filter) {
    if (filter === "approved")
        return car.status === "ACTIVE";
    if (filter === "pending")
        return car.status === "PENDING_APPROVAL";
    if (filter === "paused")
        return car.status === "INACTIVE" || car.status === "REJECTED";
    return true;
}
export function statusNote(status) {
    if (status === "ACTIVE")
        return "Đang mở lịch cho thuê";
    if (status === "PENDING_APPROVAL")
        return "Đang được CarDB thẩm định hồ sơ đăng kiểm và bảo hiểm.";
    if (status === "INACTIVE")
        return "Đang tạm ngưng nhận lịch.";
    return "Hồ sơ bị từ chối, cần cập nhật trước khi niêm yết lại.";
}

import { Link } from "react-router";
import { useMemo, useState } from "react";
import { Icon } from "@/shared/components/Icon.jsx";
import { Money } from "@/shared/components/owner/Money.jsx";
import { FilterBar, OwnerCrumb, OwnerHeading, OwnerState } from "@/shared/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/shared/components/owner/StatusBadge.jsx";
import { useOwnerCars } from "@/shared/hooks/useOwnerCars.js";
import { carSubtitle, isApprovedCar, carStatusMeta } from "@/shared/utils/owner.js";
import { ownerRoutes } from "@/app/routes/owner.routes.js";


export default function OwnerVehicles() {
    const { data, loading, error, toggleStatus } = useOwnerCars();
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");
    const cars = data ?? [];
    const visible = useMemo(() => {
        const keyword = query.trim().toLowerCase();
        return cars.filter(car => matches(car, filter) && (!keyword || `${car.brand} ${car.model} ${car.licensePlate}`.toLowerCase().includes(keyword)));
    }, [cars, filter, query]);
    const counts = {
        all: cars.length,
        approved: cars.filter(car => isApprovedCar(car.status) && car.status === "ACTIVE").length,
        pending: cars.filter(car => car.status === "PENDING_APPROVAL").length,
        paused: cars.filter(car => car.status === "INACTIVE" || car.status === "REJECTED").length,
    };
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb current="Xe của tôi"/>
      <OwnerHeading title="Xe của tôi" description={`${counts.all} phương tiện. Quản lý niêm yết, trạng thái và bảng giá cho thuê.`} actions={<Link to={ownerRoutes.vehicleNew} className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-primary-hover">
          <Icon name="add" className="text-[18px]"/>
          Đăng xe mới
        </Link>}/>
    </div>

    <OwnerState loading={loading} error={error} label="đội xe"/>
    {!loading && !error ? <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar value={filter} onChange={setFilter} options={filters.map(item => ({ ...item, label: `${item.label} (${counts[item.id]})` }))}/>
        <label className="flex items-center gap-2 rounded-xl border border-card-border bg-white px-3 py-2 text-sm text-muted-gray">
          <span className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide">Tìm</span>
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Biển số, hãng, dòng xe" className="w-52 bg-transparent text-charcoal outline-none placeholder:text-muted-gray"/>
        </label>
      </div>

      {visible.length === 0 ? <div className="rounded-2xl border border-card-border bg-white p-10 text-center text-sm text-muted-gray">Không có xe nào trong bộ lọc này.</div> : null}
      <div className="flex flex-col gap-4">
        {visible.map(car => <article key={car.id} className="overflow-hidden rounded-2xl border border-card-border bg-white shadow-sm">
          <div className="grid md:grid-cols-[280px_minmax(0,1fr)]">
            <div className="relative min-h-44 bg-section-bg">
              {car.primaryImageUrl ? <img src={car.primaryImageUrl} alt={`${car.brand} ${car.model}`} className="h-full w-full object-cover"/> : null}
              <span className="absolute left-3 top-3"><StatusBadge meta={carStatusMeta[car.status]}/></span>
              <span className="absolute bottom-3 left-3 rounded-lg bg-charcoal/80 px-2 py-1 font-mono text-xs font-bold text-white">{car.licensePlate}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-charcoal">{car.brand} {car.model}</h2>
                  <p className="mt-0.5 text-sm text-muted-gray">{carSubtitle(car)} • {car.manufactureYear}</p>
                </div>
                <div className="text-right">
                  <Money amount={car.pricePerDay} className="text-lg font-bold text-charcoal"/>
                  <span className="ml-1 text-xs text-muted-gray">/ngày</span>
                </div>
              </div>
              <p className="text-sm text-muted-gray">{statusNote(car.status)} Điểm giao xe: {car.pickupAddress}</p>
              <div className="mt-auto flex flex-wrap items-center gap-2">
                <Link to={ownerRoutes.vehicleEdit(car.id)} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-3.5 py-2 text-xs font-bold text-charcoal hover:border-orange-200 hover:text-brand-accent">
                  <Icon name="edit_square" className="text-[16px]"/>
                  {car.status === "PENDING_APPROVAL" ? "Cập nhật hồ sơ" : "Chỉnh sửa"}
                </Link>
                {car.status === "ACTIVE" ? <Link to={ownerRoutes.calendar} className="inline-flex items-center gap-1.5 rounded-xl border border-card-border px-3.5 py-2 text-xs font-bold text-charcoal hover:border-orange-200 hover:text-brand-accent">
                  <Icon name="calendar_month" className="text-[16px]"/>
                  Lịch cho thuê
                </Link> : null}
                {car.status === "ACTIVE" || car.status === "INACTIVE" ? <button type="button" disabled={toggleStatus.running} onClick={() => void toggleStatus.run(car)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-accent px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-hover disabled:opacity-60">
                  <Icon name={car.status === "ACTIVE" ? "lock" : "check"} className="text-[16px]"/>
                  {car.status === "ACTIVE" ? "Tạm ngưng niêm yết" : "Bật lại niêm yết"}
                </button> : null}
              </div>
            </div>
          </div>
        </article>)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-card-border bg-white px-5 py-4 text-sm text-muted-gray">
        <span className="inline-flex items-center gap-2"><Icon name="directions_car" className="text-[18px] text-charcoal"/> {counts.all} xe đã đăng • {counts.approved} đang cho thuê • {counts.pending} chờ duyệt • {counts.paused} tạm ẩn</span>
        <a href="tel:19008899" className="inline-flex items-center gap-1.5 font-bold text-brand-accent"><Icon name="call" className="text-[16px]"/> 1900 8899 (Phím 2)</a>
      </div>
    </> : null}
  </div>;
}
