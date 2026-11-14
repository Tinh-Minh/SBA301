import { Link, useParams } from "react-router";
import { LiveState } from "@/components/LiveUi.jsx";
import { OwnerCrumb } from "@/components/owner/OwnerScreen.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { StatCard } from "@/components/booking/Stats.jsx";
import { SafetyManager } from "@/components/booking/SafetyManager.jsx";
import { TripCard, nextAction } from "@/components/booking/TripParts.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { ownerRoutes } from "@/routes/paths.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney, resolveAssetUrl } from "@/utils/labels.js";
import { carStatusMeta } from "@/utils/owner.js";

/** Bảng theo dõi riêng của một xe: tình trạng, dòng tiền, đơn nhận được, hồ sơ an toàn. */
export default function OwnerCarOverviewPage() {
    const carId = Number(useParams().id);
    const dash = useApiQuery(["dashboard", "owner"], tripService.ownerDashboard);
    const bookings = useApiQuery(["owner", "bookings"], tripService.ownerList);
    const c = dash.data?.cars.find(item => item.carId === carId);
    if (!dash.data) return <LiveState loading={dash.loading} error={dash.error} label="dữ liệu xe" onRetry={dash.reload}/>;
    if (!c) return <p className="rounded-2xl border border-card-border bg-white p-6 text-sm">Không tìm thấy xe này trong đội xe của bạn.</p>;
    const mine = (bookings.data ?? []).filter(b => b.carId === carId);
    return <div className="flex min-w-0 flex-col gap-5">
    <OwnerCrumb homeHref={ownerRoutes.dashboard} parent={{ href: ownerRoutes.vehicles, label: "Xe của tôi" }} current={c.carName}/>
    <header className="flex flex-wrap items-center gap-4 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      {c.imageUrl ? <img src={resolveAssetUrl(c.imageUrl)} alt="" className="h-20 w-32 rounded-xl object-cover"/> : null}
      <div className="min-w-0 flex-1"><h1 className="text-xl font-bold text-charcoal">{c.carName}</h1><p className="font-mono text-sm text-muted-gray">{c.licensePlate}</p></div>
      <StatusBadge meta={carStatusMeta[c.carStatus]}/>
      <Link to={ownerRoutes.vehicleEdit(carId)} className="rounded-xl border border-card-border px-3 py-2 text-xs font-bold">Sửa thông tin xe</Link>
    </header>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Doanh thu" value={formatMoney(c.revenue)} tone="good" hint={`${c.completedBookings} chuyến • ${c.rentedHours} giờ cho thuê`}/>
      <StatCard label="Sắp thu" value={formatMoney(c.upcomingRevenue)} hint={c.nextPickupAt ? `Giao xe kế tiếp ${formatDateTime(c.nextPickupAt)}` : "Chưa có lịch giao xe"}/>
      <StatCard label="Chi gói đăng tin" value={formatMoney(c.packageSpend)} hint={`Lãi ước tính ${formatMoney(Number(c.revenue) - Number(c.packageSpend))}`}/>
      <StatCard label="Đơn nhận được" value={c.totalBookings} tone={c.pendingRequests ? "warn" : "default"} hint={`${c.pendingRequests} chờ xác nhận • ${c.cancelledBookings} huỷ/từ chối • ${c.reviewCount ? `${c.averageRating}★` : "chưa có đánh giá"}`}/>
    </div>
    <section className="flex flex-col gap-3">
      <h2 className="font-bold text-charcoal">Đơn thuê của xe này</h2>
      {mine.length ? mine.map(b => <TripCard key={b.id} booking={b} role="owner" highlight={nextAction(b, "owner")}/>) : <p className="rounded-2xl border border-card-border bg-white p-5 text-sm text-muted-gray">Xe chưa có đơn thuê nào.</p>}
    </section>
    <SafetyManager carId={carId}/>
  </div>;
}
