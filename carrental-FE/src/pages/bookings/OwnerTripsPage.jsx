import { SummaryCard } from "@/components/SummaryCard.jsx";
import { useMemo, useState } from "react";
import { FilterBar, OwnerCrumb, OwnerHeading, OwnerState } from "@/components/owner/OwnerScreen.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { ownerRoutes } from "@/routes/paths.js";
import { useHandoverActions } from "@/hooks/useHandovers.js";
import { orderService } from "@/hooks/useBookings.js";
import { TripCard, filters, tripGroup } from "@/components/bookings/components/TripCard.jsx";

export default function OwnerTrips() {
    const resource = useApiQuery(["owner", "bookings"], () => orderService.listMine());
    const { createHandover, confirmHandover } = useHandoverActions(resource.reload);
    const [filter, setFilter] = useState("all");
    const rows = (resource.data ?? []).filter(item => item.order.status === "CONFIRMED" || item.order.status === "ONGOING" || item.order.status === "COMPLETED");
    const visible = useMemo(() => rows.filter(item => filter === "all" || tripGroup(item.order.status) === filter), [rows, filter]);
    const ongoing = rows.filter(item => item.order.status === "ONGOING");
    const deposits = ongoing.reduce((sum, item) => sum + item.order.depositAmount, 0);
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Quản lý chuyến xe" parent={{ href: ownerRoutes.dashboard, label: "Bảng điều khiển" }}/>
      <OwnerHeading title="Quản lý chuyến xe" description="Theo dõi giao nhận, biên bản C10-A trước chuyến và C10-B khi trả xe."/>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <SummaryCard compact label="Đang lăn bánh" value={`${ongoing.length} chuyến`} hint="Đã ký nhận xe"/>
      <SummaryCard compact label="Sắp giao" value={`${rows.filter(item => item.order.status === "CONFIRMED").length} xe`} hint="Cần lập biên bản C10-A"/>
      <SummaryCard compact label="Cọc chủ xe đang giữ" value={new Intl.NumberFormat("vi-VN").format(deposits) + " đ"} hint="Thu khi ký C10-A, không qua escrow"/>
    </div>
    <OwnerState loading={resource.loading && !resource.data} error={resource.error} label="chuyến xe"/>
    {resource.data ? <>
      <FilterBar value={filter} onChange={setFilter} options={filters.map(item => ({ ...item, label: `${item.label} (${item.id === "all" ? rows.length : rows.filter(row => tripGroup(row.order.status) === item.id).length})` }))}/>
      {visible.length === 0 ? <div className="rounded-2xl border border-card-border bg-white p-10 text-center text-sm text-muted-gray">Không có chuyến trong bộ lọc này.</div> : null}
      <div className="flex flex-col gap-4">
        {visible.map(item => <TripCard key={item.order.id} item={item} busy={createHandover.running || confirmHandover.running} error={createHandover.error ?? confirmHandover.error} onCreate={input => void createHandover.run(item.order.id, input)} onConfirm={id => void confirmHandover.run(id)}/>)}
      </div>
    </> : null}
  </div>;
}
