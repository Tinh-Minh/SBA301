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
    <header className="editorial-hero-banner flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
      <div>
        <span className="editorial-kicker">Kênh chủ xe đối tác</span>
        <h1 className="mt-1.5 text-2xl font-extrabold text-[#25251F] sm:text-3xl">Xin chào, {user?.fullName}</h1>
        <p className="mt-1 text-sm text-[#5C584F]">Tổng quan đội xe, đơn thuê và dòng tiền.</p>
      </div>
      <Link to={ownerRoutes.vehicleNew} className="inline-flex items-center gap-2 self-start rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white shadow-sm sm:self-center"><Icon name="add" className="text-[18px]"/>Đăng xe mới</Link>
    </header>

    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Đội xe" value={`${d.totalCars} xe`} hint={`${d.approvedCars} đã duyệt • ${d.listedCars} đang hiển thị`}/>
      <StatCard label="Đơn cần xử lý" value={d.actionNeeded.length} tone={d.actionNeeded.length ? "warn" : "default"} hint={`${d.pendingRequests} yêu cầu mới • ${d.activeBookings} đơn đang chạy`}/>
      <StatCard label="Doanh thu cho thuê" value={formatMoney(d.totalRevenue)} tone="good" hint={`${d.completedBookings} chuyến hoàn tất • sắp tới ${formatMoney(d.upcomingRevenue)}`}/>
      <StatCard label="Thực nhận ước tính" value={formatMoney(d.netIncome)} tone="brand" hint={`Sau khi trừ ${formatMoney(d.packageSpend)} gói đăng tin`}/>
    </div>

    {d.actionNeeded.length ? <section className="flex flex-col gap-2.5 rounded-2xl border border-[#FDBA8C] bg-[#FFF7F2] p-5">
      <div className="flex items-center justify-between"><h2 className="text-sm font-extrabold text-[#9A3412]">Việc cần làm ({d.actionNeeded.length})</h2><Link to="/owner/bookings" className="text-xs font-bold text-[#FC6C26]">Tất cả đơn thuê →</Link></div>
      {d.actionNeeded.slice(0, 4).map(b => <TripCard key={b.id} booking={b} role="owner" highlight={nextAction(b, "owner")}/>)}
    </section> : null}

    <div className="flex flex-col gap-5">
      <section className="overflow-x-auto rounded-2xl border border-[#E4E2D8] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#ECEAE2] px-5 py-4">
          <h2 className="font-extrabold text-[#25251F]">Theo dõi từng xe</h2>
          <Link to={ownerRoutes.vehicles} className="text-xs font-bold text-[#FC6C26]">Quản lý đội xe →</Link>
        </div>
        <table className="w-full min-w-[880px] table-fixed text-left text-sm">
          <colgroup><col className="w-[26%]"/><col className="w-[14%]"/><col className="w-[12%]"/><col className="w-[14%]"/><col className="w-[13%]"/><col className="w-[11%]"/><col className="w-[10%]"/></colgroup>
          <thead><tr className="whitespace-nowrap">
            <th className="px-4 py-3">Xe</th><th className="px-3 py-3">Hiển thị</th><th className="px-3 py-3">An toàn</th><th className="px-3 py-3">Đơn thuê</th>
            <th className="px-3 py-3 text-right">Doanh thu</th><th className="px-3 py-3 text-right">Chi gói</th><th className="px-4 py-3 text-right">Đánh giá</th>
          </tr></thead>
          <tbody>{d.cars.map(c => {
            const approved = c.carStatus === "ACTIVE";
            const visibility = approved ? listingMeta[c.listingStatus] : carStatusMeta[c.carStatus];
            return <tr key={c.carId} className="border-t border-[#ECEAE2]">
              <td className="px-4 py-3.5 align-middle">
                <Link to={`/owner/vehicles/${c.carId}/overview`} className="group flex min-w-0 items-center gap-3">
                  {c.imageUrl ? <img src={resolveAssetUrl(c.imageUrl)} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover"/> : <span className="h-10 w-14 shrink-0 rounded-lg bg-[#EFEDE7]"/>}
                  <span className="min-w-0"><span className="block truncate font-bold text-[#25251F] group-hover:text-[#FC6C26]">{c.carName}</span><span className="block font-mono text-xs text-[#6C6C61]">{c.licensePlate}</span></span>
                </Link>
              </td>
              <td className="px-3 py-3.5 align-middle"><StatusBadge meta={visibility}/></td>
              <td className="px-3 py-3.5 align-middle"><SafetyBadge level={c.safetyLevel}/></td>
              <td className="px-3 py-3.5 align-middle">
                <span className="block font-bold tabular-nums">{c.totalBookings} đơn</span>
                <span className={`block text-xs ${c.pendingRequests ? "font-bold text-[#B45309]" : "text-[#6C6C61]"}`}>{c.pendingRequests ? `${c.pendingRequests} chờ xác nhận` : c.activeBookings ? `${c.activeBookings} đang chạy` : `${c.completedBookings} hoàn tất`}</span>
              </td>
              <td className="px-3 py-3.5 text-right align-middle"><span className="block whitespace-nowrap font-bold tabular-nums text-[#047857]">{formatMoney(c.revenue)}</span><span className="block text-xs text-[#6C6C61]">{c.rentedHours} giờ</span></td>
              <td className="px-3 py-3.5 text-right align-middle whitespace-nowrap tabular-nums">{formatMoney(c.packageSpend)}</td>
              <td className="px-4 py-3.5 text-right align-middle whitespace-nowrap tabular-nums">{c.reviewCount ? <>{c.averageRating}<span className="text-[#6C6C61]">/5 · {c.reviewCount}</span></> : <span className="text-[#6C6C61]">—</span>}</td>
            </tr>;
          })}</tbody>
        </table>
        {!d.cars.length ? <p className="p-5 text-sm text-[#5C584F]">Chưa có xe nào. <Link to={ownerRoutes.vehicleNew} className="font-bold text-[#FC6C26]">Đăng xe đầu tiên</Link>.</p> : null}
      </section>
      <MonthlyBars points={d.monthly}/>
    </div>
  </div>;
}
