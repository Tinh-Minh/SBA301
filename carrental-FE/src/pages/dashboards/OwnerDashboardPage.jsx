import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { Money } from "@/components/owner/Money.jsx";
import { useOwnerDashboard } from "@/hooks/useDashboards.js";
import { ownerRoutes } from "@/routes/paths.js";
import { formatDateTime } from "@/utils/datetime.js";

function Stat({ label, value, hint }) {
    return <article className="flex h-full flex-col gap-2 rounded-2xl border border-card-border bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wide text-muted-gray">{label}</p>
    <p className="text-2xl font-bold text-charcoal">{value}</p>
    <p className="min-h-10 text-xs leading-5 text-muted-gray">{hint}</p>
  </article>;
}

export default function OwnerDashboard() {
    const { data, loading, error, reload } = useOwnerDashboard();
    if (loading && !data)
        return <div className="rounded-2xl border border-card-border bg-white p-10 text-center text-sm text-muted-gray">Đang tải bảng điều khiển…</div>;
    if (error || !data)
        return <div className="rounded-2xl border border-red-200 bg-white p-10 text-center text-sm text-[#B91C1C]">{error?.message ?? "Không tải được dữ liệu."} <button type="button" onClick={reload} className="font-bold underline">Thử lại</button></div>;
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-bold text-charcoal">Xin chào, {data.ownerName}</h1>
        <p className="mt-1 text-sm text-muted-gray">Theo dõi xe đã duyệt, gói đang hiển thị và giao dịch mua gói đăng tin.</p>
      </div>
      <Link to={ownerRoutes.vehicleNew} className="inline-flex items-center gap-2 self-start rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white"><Icon name="add" className="text-[18px]"/>Đăng xe mới</Link>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Xe của tôi" value={`${data.totalCars} xe`} hint="Tổng xe đã tạo hồ sơ"/>
      <Stat label="Xe đã duyệt" value={`${data.approvedCars} xe`} hint="Đủ điều kiện mua gói đăng tin"/>
      <Stat label="Đang hiển thị" value={`${data.listedCars} tin`} hint={`${data.activeListings} gói còn hiệu lực`}/>
      <Stat label="Chờ thanh toán" value={`${data.pendingPayments} gói`} hint="Thanh toán để tin xuất hiện trên sàn"/>
    </div>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Link to={ownerRoutes.subscriptionNew} className="rounded-2xl border border-card-border bg-white p-4 text-sm font-bold text-charcoal">Mua gói đăng tin</Link>
      <Link to={ownerRoutes.subscriptions} className="rounded-2xl border border-card-border bg-white p-4 text-sm font-bold text-charcoal">Xem gói của tôi</Link>
      <Link to={ownerRoutes.payouts} className="rounded-2xl border border-card-border bg-white p-4 text-sm font-bold text-charcoal">Giao dịch đã thanh toán</Link>
    </div>
    <section className="rounded-2xl border border-card-border bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-charcoal">Gói chờ thanh toán</h2>
        <span className="text-sm text-muted-gray">Đã thu <Money amount={data.paidTotal}/></span>
      </div>
      {data.pendingPaymentsList.length === 0 ? <p className="mt-3 text-sm text-muted-gray">Không có gói nào đang chờ thanh toán.</p> : <ul className="mt-3 flex flex-col gap-2">
        {data.pendingPaymentsList.map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#F7F7F5] px-3 py-2 text-sm">
          <span>{item.carName} • {item.packageName}</span>
          <Link to={`${ownerRoutes.subscriptions}/${item.id}`} className="font-bold text-[#FC6C26]">Thanh toán</Link>
        </li>)}
      </ul>}
    </section>
    <section className="rounded-2xl border border-card-border bg-white p-5">
      <h2 className="font-bold text-charcoal">Hoạt động gần đây</h2>
      {data.activities.length === 0 ? <p className="mt-3 text-sm text-muted-gray">Chưa có gói hoặc giao dịch.</p> : <ul className="mt-3 flex flex-col gap-2 text-sm">
        {data.activities.map(item => <li key={item.id} className="flex justify-between gap-3 border-b border-[#F2F2F0] py-2"><span>{item.title}<span className="block text-xs text-muted-gray">{item.subtitle}</span></span><span className="shrink-0 text-xs text-muted-gray">{formatDateTime(item.at)}</span></li>)}
      </ul>}
    </section>
  </div>;
}
