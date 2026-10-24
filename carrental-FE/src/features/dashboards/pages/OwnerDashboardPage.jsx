import { Link } from "react-router";
import { Icon } from "@/shared/components/Icon.jsx";
import { Money } from "@/shared/components/owner/Money.jsx";
import { useOwnerDashboard } from "@/shared/hooks/useDashboards.js";
import { maskBankAccount } from "@/shared/utils/owner.js";
import { ownerRoutes } from "@/app/routes/paths.js";
import { ActivityRow, PendingRow, QuickAction, StatCard, VehicleCard } from "@/features/dashboards/components/StatCard.jsx";

export default function OwnerDashboard() {
    const { data, loading, error } = useOwnerDashboard();
    if (loading)
        return <div className="rounded-2xl border border-card-border bg-white p-10 text-center text-sm text-muted-gray">Đang tải bảng điều khiển…</div>;
    if (error || !data)
        return <div className="rounded-2xl border border-red-200 bg-error-container p-10 text-center text-sm text-on-error-container">{error?.message ?? "Không tải được dữ liệu bảng điều khiển."}</div>;
    const bankLabel = data.defaultBankAccount ? `${data.defaultBankAccount.bankName} ${maskBankAccount(data.defaultBankAccount.accountNumber)}` : "Chưa liên kết";
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <nav aria-label="Đường dẫn" className="flex items-center gap-1.5 text-xs font-medium text-muted-gray">
        <Link to={ownerRoutes.dashboard} className="transition-colors hover:text-charcoal">Cho thuê xe</Link>
        <span>/</span>
        <span className="font-semibold text-charcoal">Bảng điều khiển chủ xe</span>
      </nav>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold leading-snug tracking-tight text-charcoal sm:text-[28px]">Bảng điều khiển chủ xe</h1>
          <p className="mt-0.5 text-sm text-muted-gray">Theo dõi xe, lịch cho thuê, yêu cầu đặt xe và đối soát doanh thu của bạn.</p>
        </div>
        <Link to={ownerRoutes.vehicleNew} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-primary-hover sm:self-auto">
          <Icon name="add" className="text-[18px]"/>
          Đăng xe mới
        </Link>
      </div>
    </div>

    <div className="grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Xe đã đăng" value={`${data.totalCars} xe`} hint="Tổng phương tiện sở hữu" icon="directions_car" iconClass="border-card-border bg-bg-light text-charcoal"/>
      <StatCard label="Xe đã duyệt" value={`${data.approvedCars} xe`} hint="Đủ điều kiện niêm yết" pill={{ text: "Đang mở lịch", className: "border-emerald-200 bg-emerald-light/60 text-emerald-accent" }} icon="verified" iconClass="border-emerald-200 bg-status-green-bg text-emerald-accent"/>
      <StatCard label="Yêu cầu chờ" value={`${data.pendingOrders} yêu cầu`} hint="Cần chủ xe phản hồi" pill={{ text: "Cần xử lý", className: "border-amber-200 bg-status-amber-bg text-status-amber-dark" }} icon="pending_actions" iconClass="border-amber-200 bg-status-amber-bg text-status-amber-dark"/>
      <StatCard label="Chuyến đang thuê" value={`${data.ongoingTrips} chuyến`} hint="Đang trong thời gian thuê" pill={{ text: "Lăn bánh", className: "border-blue-200 bg-status-blue-bg text-info-blue" }} icon="timeline" iconClass="border-blue-200 bg-status-blue-bg text-info-blue"/>
    </div>

    <div className="flex flex-col gap-2.5">
      <span className="text-xs font-bold uppercase tracking-wider text-muted-gray">Thao tác nhanh</span>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickAction href={ownerRoutes.vehicleNew} label="＋ Đăng xe mới"/>
        <QuickAction href={ownerRoutes.calendar} label="📅 Quản lý lịch"/>
        <QuickAction href={ownerRoutes.requests} label="📋 Xem yêu cầu thuê"/>
        <QuickAction href={ownerRoutes.trips} label="🔑 Quản lý bàn giao"/>
      </div>
    </div>

    {data.pendingRequests.length > 0 ? <section className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="size-2.5 rounded-full bg-status-amber"/>
          <h2 className="text-base font-bold text-charcoal sm:text-lg">Yêu cầu thuê cần xử lý</h2>
        </div>
        <span className="whitespace-nowrap rounded-full bg-status-amber-bg px-2.5 py-1 text-xs font-bold text-status-amber-dark">{data.pendingRequests.length} yêu cầu chờ duyệt</span>
      </div>
      <div className="mt-1 overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-card-border bg-bg-light text-[12px] font-bold uppercase tracking-wider text-muted-gray">
              <th className="w-[16%] rounded-l-lg px-4 py-3">Mã đơn</th>
              <th className="w-[22%] px-4 py-3">Phương tiện</th>
              <th className="w-[20%] px-4 py-3">Khách thuê</th>
              <th className="w-[22%] px-4 py-3">Thời gian thuê</th>
              <th className="w-[10%] px-4 py-3">Trạng thái</th>
              <th className="w-[10%] rounded-r-lg px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border text-sm">
            {data.pendingRequests.map(item => <PendingRow key={item.order.id} item={item}/>)}
          </tbody>
        </table>
      </div>
    </section> : null}

    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="garage_home" className="text-[22px] text-brand-accent"/>
          <h2 className="text-base font-bold text-charcoal sm:text-lg">Xe đang quản lý</h2>
        </div>
        <Link to={ownerRoutes.vehicles} className="inline-flex items-center gap-1 text-sm font-bold text-brand-accent transition-colors hover:text-primary-hover">
          Xem tất cả xe ({data.totalCars})
          <Icon name="arrow_forward" className="text-[16px]"/>
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {data.managedCars.map(item => <VehicleCard key={item.car.id} item={item}/>)}
      </div>
    </section>

    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <section className="flex flex-col gap-4 rounded-2xl border border-card-border bg-white p-5 shadow-sm lg:col-span-7">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Icon name="history" className="text-[20px] text-brand-accent"/>
            <h2 className="text-base font-bold text-charcoal sm:text-lg">Hoạt động cho thuê gần đây</h2>
          </div>
          <span className="whitespace-nowrap text-xs text-muted-gray">Cập nhật theo thời gian thực</span>
        </div>
        <div className="mt-1 flex flex-col gap-1 pl-1">
          {data.activities.map(item => <ActivityRow key={item.id} item={item}/>)}
        </div>
      </section>

      <section className="flex flex-col justify-between gap-5 rounded-2xl border-2 border-card-border bg-white p-6 shadow-sm lg:col-span-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Icon name="payments" className="shrink-0 text-[20px] text-brand-accent"/>
              <h2 className="whitespace-nowrap text-base font-bold text-charcoal sm:text-lg">Tổng quan doanh thu</h2>
            </div>
            <Link to={ownerRoutes.payouts} className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-bold text-brand-accent hover:text-primary-hover">
              Chi tiết đối soát
              <Icon name="arrow_forward" className="text-[15px]"/>
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between rounded-xl border border-card-border bg-bg-light p-3.5">
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-gray">Doanh thu đã ghi nhận</span>
                <span className="text-[11px] text-muted-gray">Kỳ đối soát T10/2026</span>
              </div>
              <Money amount={data.recognizedGross} className="text-2xl font-bold tracking-tight text-charcoal"/>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-orange-100 bg-accent-soft/60 p-3.5">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-brand-accent">Khoản đang chờ chi trả</span>
                <span className="text-[11px] text-muted-gray">Sau khi hoàn tất trả xe</span>
              </div>
              <Money amount={data.escrowNet} className="text-xl font-bold tracking-tight text-brand-accent"/>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-light/60 p-3.5">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-emerald-accent">Đã chi trả về tài khoản</span>
                <span className="text-[11px] text-muted-gray">{bankLabel}</span>
              </div>
              <Money amount={data.paidNet} className="text-xl font-bold tracking-tight text-emerald-accent"/>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-card-border bg-gray-50 p-3 text-xs text-muted-gray">
            <Icon name="lock" className="shrink-0 text-[18px] text-brand-accent"/>
            <p className="font-medium leading-normal text-charcoal">Doanh thu được giữ an toàn và chi trả tự động sau khi hoàn tất trả xe.</p>
          </div>
        </div>
        <Link to="/account/bank" className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-white px-4 py-2.5 text-center text-xs font-medium text-charcoal shadow-sm transition-all hover:border-brand-accent hover:text-brand-accent">
          <Icon name="account_balance" className="text-[18px]"/>
          Quản lý tài khoản nhận tiền
        </Link>
      </section>
    </div>
  </div>;
}
