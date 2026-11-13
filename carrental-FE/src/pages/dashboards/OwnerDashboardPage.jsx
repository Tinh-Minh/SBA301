import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";
import { MonthlyBars, StatCard } from "@/components/booking/Stats.jsx";
import { SafetyBadge } from "@/components/booking/SafetyPanel.jsx";
import { TripCard, nextAction } from "@/components/booking/TripParts.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { useAuth } from "@/hooks/useAuth.js";
import { ownerRoutes } from "@/routes/paths.js";
import { tripService } from "@/services/tripService.js";
import { formatDateTime } from "@/utils/datetime.js";
import { formatMoney, resolveAssetUrl } from "@/utils/labels.js";
import { carStatusMeta } from "@/utils/owner.js";

const listingMeta = { LISTED: { label: "Đang hiển thị", tone: "success" }, UNLISTED: { label: "Chưa hiển thị", tone: "neutral" }, EXPIRED: { label: "Hết gói", tone: "warning" } };

/** Bảng tổng của chủ xe + bảng theo dõi từng xe. */
export default function OwnerDashboard() {
    const { user } = useAuth();
    const dash = useApiQuery(["dashboard", "owner"], tripService.ownerDashboard);
    const d = dash.data;
    if (!d) return <LiveState loading={dash.loading} error={dash.error} label="bảng điều khiển" onRetry={dash.reload}/>;
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Xin chào, {user?.fullName}</h1>
        <p className="mt-1 text-sm text-muted-gray">Tổng quan đội xe, đơn thuê và dòng tiền.</p>
      </div>
      <Link to={ownerRoutes.vehicleNew} className="inline-flex items-center gap-2 self-start rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white"><Icon name="add" className="text-[18px]"/>Đăng xe mới</Link>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Đội xe" value={`${d.totalCars} xe`} hint={`${d.approvedCars} đã duyệt • ${d.listedCars} đang hiển thị`}/>
      <StatCard label="Đơn cần xử lý" value={d.actionNeeded.length} tone={d.actionNeeded.length ? "warn" : "default"} hint={`${d.pendingRequests} yêu cầu mới • ${d.activeBookings} đơn đang chạy`}/>
      <StatCard label="Doanh thu cho thuê" value={formatMoney(d.totalRevenue)} tone="good" hint={`${d.completedBookings} chuyến hoàn tất • sắp tới ${formatMoney(d.upcomingRevenue)}`}/>
      <StatCard label="Thực nhận ước tính" value={formatMoney(d.netIncome)} tone="brand" hint={`Sau khi trừ ${formatMoney(d.packageSpend)} gói đăng tin`}/>
    </div>

    {d.actionNeeded.length ? <section className="flex flex-col gap-2 rounded-2xl border border-[#FDBA8C] bg-[#FFF7F2] p-4">
      <div className="flex items-center justify-between"><h2 className="text-sm font-bold text-[#9A3412]">Việc cần làm ({d.actionNeeded.length})</h2><Link to="/owner/bookings" className="text-xs font-bold text-[#FC6C26]">Tất cả đơn thuê →</Link></div>
      {d.actionNeeded.slice(0, 4).map(b => <TripCard key={b.id} booking={b} role="owner" highlight={nextAction(b, "owner")}/>)}
    </section> : null}

    <div className="flex flex-col gap-4">
      <section className="overflow-x-auto rounded-2xl border border-card-border bg-white shadow-sm">
        <h2 className="px-4 pt-4 font-bold text-charcoal">Theo dõi từng xe</h2>
        <table className="mt-2 w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase text-muted-gray"><tr><th className="px-4 py-2">Xe</th><th>Trạng thái</th><th>An toàn</th><th>Đơn</th><th>Doanh thu</th><th>Chi gói</th><th>Đánh giá</th><th/></tr></thead>
          <tbody>{d.cars.map(c => <tr key={c.carId} className="border-t border-card-border align-top">
            <td className="px-4 py-3"><div className="flex items-center gap-3">{c.imageUrl ? <img src={resolveAssetUrl(c.imageUrl)} alt="" className="h-10 w-14 rounded-lg object-cover"/> : null}<div><p className="font-semibold">{c.carName}</p><p className="font-mono text-xs text-muted-gray">{c.licensePlate}</p></div></div></td>
            <td className="py-3"><div className="flex flex-col items-start gap-1"><StatusBadge meta={carStatusMeta[c.carStatus]}/><StatusBadge meta={listingMeta[c.listingStatus]}/></div></td>
            <td className="py-3"><SafetyBadge level={c.safetyLevel}/></td>
            <td className="py-3 text-xs"><b className="text-sm">{c.totalBookings}</b><br/>{c.pendingRequests ? <span className="text-[#B45309]">{c.pendingRequests} chờ xác nhận<br/></span> : null}{c.activeBookings ? `${c.activeBookings} đang chạy • ` : ""}{c.completedBookings} xong{c.nextPickupAt ? <><br/>Giao kế tiếp: {formatDateTime(c.nextPickupAt)}</> : null}</td>
            <td className="py-3"><b>{formatMoney(c.revenue)}</b><br/><span className="text-xs text-muted-gray">{c.rentedHours} giờ cho thuê</span></td>
            <td className="py-3 text-xs">{formatMoney(c.packageSpend)}</td>
            <td className="py-3 text-xs">{c.reviewCount ? `${c.averageRating}/5 (${c.reviewCount})` : "—"}</td>
            <td className="py-3 pr-4 text-right"><Link to={`/owner/vehicles/${c.carId}/overview`} className="text-xs font-bold text-brand-accent">Chi tiết →</Link></td>
          </tr>)}</tbody>
        </table>
        {!d.cars.length ? <p className="p-4 text-sm text-muted-gray">Chưa có xe nào. <Link to={ownerRoutes.vehicleNew} className="font-bold text-brand-accent">Đăng xe đầu tiên</Link>.</p> : null}
      </section>
      <MonthlyBars points={d.monthly}/>
    </div>
  </div>;
}
