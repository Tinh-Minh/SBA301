import { Link } from "react-router";
import { AdminPageHeader, AdminState, StatusPill } from "@/components/admin/AdminUi.jsx";
import { Money } from "@/components/owner/Money.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { formatTrVnd } from "@/utils/owner.js";
import { adminRoutes } from "@/routes/paths.js";
import { formatDateTime } from "@/utils/datetime.js";
import { kycStatusLabels, orderStatusLabels } from "@/utils/labels.js";
import { getAdminOverview } from "@/services/adminService.js";
import { Stat, orderTone } from "@/components/dashboards/DashboardStat.jsx";

export default function AdminDashboard() {
    const { data, loading, error, reload } = useApiQuery(["admin", "dashboard"], getAdminOverview);
    const totals = data?.totals;
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A01" title="Tổng quan quản trị" description="Chỉ số vận hành, hồ sơ chờ duyệt và đơn thuê mới nhất lấy trực tiếp từ hệ thống." actions={<button type="button" onClick={reload} className="rounded-xl border border-[#E9E9E7] bg-white px-4 py-2 text-sm font-bold">Làm mới</button>}/>
    <AdminState loading={loading && !data} error={error} label="tổng quan" onRetry={reload}/>
    {totals ? <>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="GMV (đơn đã xác nhận)" value={formatTrVnd(totals.gmv)} hint={`${totals.ordersThisMonth} đơn tạo trong tháng này`}/>
      <Stat label="Phí nền tảng" value={formatTrVnd(totals.platformFee)} hint="Tính theo hoa hồng trên từng đơn"/>
      <Stat label="Tổng đơn" value={`${totals.orders} đơn`} hint={`${totals.ongoing} đang lăn bánh`}/>
      <Stat label="Việc cần xử lý" value={`${totals.pendingDocs + totals.pendingCars + totals.openDisputes + totals.pendingPayouts} mục`} hint={`${totals.pendingDocs} giấy tờ • ${totals.pendingCars} xe • ${totals.openDisputes} khiếu nại • ${totals.pendingPayouts} chi trả`}/>
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
            <StatusPill tone="warning">Chờ duyệt niêm yết</StatusPill>
            <Link to={`${adminRoutes.vehicles}?id=${car.id}`} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Thẩm định xe →</Link>
          </li>)}
          {!data.pendingKyc.length && !data.pendingCars.length ? <li className="text-sm text-[#666666]">Không có hồ sơ nào đang chờ.</li> : null}
        </ul>
      </article>
      <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#292929]">Đơn thuê mới nhất</h2>
          <Link to={adminRoutes.orders} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Xem tất cả →</Link>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {data.latestOrders.map(order => <li key={order.id} className="rounded-xl border border-[#E9E9E7] p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="whitespace-nowrap font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</span>
              <StatusPill tone={orderTone[order.status]}>{orderStatusLabels[order.status] ?? order.status}</StatusPill>
            </div>
            <p className="mt-1 truncate text-sm font-bold text-[#292929]">{order.carName} • {order.licensePlate}</p>
            <p className="truncate text-xs text-[#666666]">{order.customerName} → {order.ownerName} • {formatDateTime(order.startTime)}</p>
            <p className="mt-1 whitespace-nowrap text-sm text-[#292929]"><Money amount={order.totalAmount}/> • phí {order.commissionRate}% <Money amount={Math.round(order.rentalAmount * order.commissionRate / 100)}/></p>
          </li>)}
          {!data.latestOrders.length ? <li className="text-sm text-[#666666]">Chưa có đơn thuê nào.</li> : null}
        </ul>
      </article>
    </section>
    </> : null}
  </div>;
}
