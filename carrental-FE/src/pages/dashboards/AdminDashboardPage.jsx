import { Link } from "react-router";
import { AdminPageHeader, AdminState, StatusPill } from "@/components/admin/AdminUi.jsx";
import { Money } from "@/components/owner/Money.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { formatTrVnd } from "@/utils/owner.js";
import { adminRoutes } from "@/routes/paths.js";
import { formatDateTime } from "@/utils/datetime.js";
import { kycStatusLabels, transactionTypeLabels } from "@/utils/labels.js";
import { getAdminOverview } from "@/services/adminService.js";
import { tripService } from "@/services/tripService.js";
import { Stat } from "@/components/dashboards/DashboardStat.jsx";

const txStatus = { PENDING: "Chờ thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại" };

function BookingOverview() {
    const { data } = useApiQuery(["admin", "bookings", "stats"], tripService.adminStats);
    if (!data) return null;
    return <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Đơn thuê" value={`${data.total} đơn`} hint={`${data.requested} chờ chủ xe • ${data.inProgress} đang thuê`}/>
      <Stat label="Tranh chấp biên bản" value={`${data.disputedHandovers} biên bản`} hint="Khách yêu cầu chủ xe sửa hiện trạng"/>
      <Stat label="Giá trị chuyến hoàn tất" value={formatTrVnd(data.completedValue)} hint={`${data.completed} chuyến hoàn tất`}/>
      <Link to="/admin/bookings" className="flex items-center justify-center rounded-2xl border border-[#E9E9E7] bg-white p-4 text-sm font-bold text-[#FC6C26]">Quản lý đơn thuê →</Link>
    </section>;
}

export default function AdminDashboard() {
    const { data, loading, error, reload } = useApiQuery(["admin", "dashboard"], getAdminOverview);
    const totals = data?.totals;
    const revenue = data?.revenue;
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A01" title="Tổng quan quản trị" description="Doanh thu gói đăng tin, đơn thuê, hồ sơ chờ duyệt và giao dịch gần nhất." actions={<button type="button" onClick={reload} className="rounded-xl border border-[#E9E9E7] bg-white px-4 py-2 text-sm font-bold">Làm mới</button>}/>
    <AdminState loading={loading && !data} error={error} label="tổng quan" onRetry={reload}/>
    {totals ? <>
    <BookingOverview/>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Doanh thu gói" value={formatTrVnd(revenue?.totalRevenue ?? 0)} hint={`${revenue?.totalPackagesSold ?? 0} gói đã bán`}/>
      <Stat label="Tin đang hiển thị" value={`${revenue?.activeListingsCount ?? 0} tin`} hint={revenue?.bestSellingPackageName ? `Bán chạy: ${revenue.bestSellingPackageName}` : "Chưa có gói bán chạy"}/>
      <Stat label="Người dùng" value={`${totals.customers} tài khoản`} hint={`${totals.pendingDocs} giấy tờ chờ duyệt`}/>
      <Stat label="Việc cần xử lý" value={`${totals.pendingDocs + totals.pendingCars + totals.pendingSubscriptions + totals.pendingTransactions} mục`} hint={`${totals.pendingCars} xe • ${totals.pendingSubscriptions} gói chờ trả • ${totals.pendingTransactions} giao dịch chờ`}/>
    </section>
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#292929]">Hồ sơ chờ phê duyệt</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {data.pendingKyc.map(customer => <li key={`c${customer.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E9E7] p-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-[#292929]">{customer.fullName}</p>
              <p className="truncate text-xs text-[#666666]">KH #{customer.id} • {customer.email}</p>
            </div>
            <StatusPill tone="warning">{kycStatusLabels[customer.kycStatus] ?? customer.kycStatus}</StatusPill>
            <Link to={`${adminRoutes.users}?id=${customer.id}`} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Duyệt eKYC →</Link>
          </li>)}
          {data.pendingCars.map(car => <li key={`v${car.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E9E7] p-3">
            <div className="min-w-0">
              <p className="truncate font-bold text-[#292929]">{car.brand} {car.model}</p>
              <p className="truncate text-xs text-[#666666]">{car.licensePlate} • {car.city}</p>
            </div>
            <StatusPill tone="warning">Chờ duyệt xe</StatusPill>
            <Link to={`${adminRoutes.vehicles}?id=${car.id}`} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Thẩm định xe →</Link>
          </li>)}
          {!data.pendingKyc.length && !data.pendingCars.length ? <li className="text-sm text-[#666666]">Không có hồ sơ nào đang chờ.</li> : null}
        </ul>
      </article>
      <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#292929]">Giao dịch gần nhất</h2>
          <Link to={adminRoutes.payouts} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Xem tất cả →</Link>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {(revenue?.recentTransactions ?? []).map(item => {
            const refCode = item.subscriptionCode ?? item.bookingCode;
            const title = item.packageName ?? transactionTypeLabels[item.transactionType] ?? "Giao dịch";
            return <li key={item.id} className="rounded-xl border border-[#E9E9E7] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-[#FC6C26]">#{item.id}{refCode ? ` • ${refCode}` : ""}</span>
                <StatusPill tone={item.status === "SUCCESS" ? "success" : item.status === "FAILED" ? "danger" : "warning"}>{txStatus[item.status] ?? item.status}</StatusPill>
              </div>
              <p className="mt-1 truncate text-sm font-bold text-[#292929]">{[title, item.carName].filter(Boolean).join(" • ")}</p>
              <p className="text-xs text-[#666666]">{formatDateTime(item.paidAt ?? item.createdAt)}</p>
              <p className="mt-1 text-sm"><Money amount={item.amount}/></p>
            </li>;
          })}
          {!(revenue?.recentTransactions ?? []).length ? <li className="text-sm text-[#666666]">Chưa có giao dịch thành công.</li> : null}
        </ul>
      </article>
    </section>
    </> : null}
  </div>;
}
