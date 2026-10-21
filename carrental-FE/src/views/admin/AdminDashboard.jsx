"use client";
import Link from "next/link";
import { AdminPageHeader, StatusPill } from "@/components/admin/admin-ui";
import { Money } from "@/components/owner/money";
import { calculatePayout, formatTrVnd } from "@/lib/owner/finance";
import { adminRoutes } from "@/lib/admin/routes";
import { adminSeed } from "@/services/mock/admin-db";

const orderTone = { CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", PENDING: "warning", CANCELLED: "danger" };
const orderLabel = { CONFIRMED: "Đã xác nhận", ONGOING: "Đang thuê", COMPLETED: "Hoàn thành", PENDING: "Chờ xác nhận", CANCELLED: "Đã hủy" };

export default function AdminDashboard() {
    const orders = adminSeed.orders.slice(0, 3);
    return <div className="flex flex-col gap-5">
    <AdminPageHeader code="A01" title="Tổng quan quản trị" description="Báo cáo chỉ số vận hành, hồ sơ chờ duyệt và đơn thuê toàn quốc."/>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="GMV tháng 10" value={formatTrVnd(1280000000)} hint="+22,4% so với T9"/>
      <Stat label="Phí nền tảng 10%" value={formatTrVnd(128000000)} hint={`${formatTrVnd(128000000)} trên GMV`}/>
      <Stat label="Tổng đơn" value="342 đơn" hint="48 đang lăn bánh"/>
      <Stat label="Hồ sơ SLA" value="20 hồ sơ" hint="12 KYC • 8 xe"/>
    </section>
    <section className="grid gap-4 xl:grid-cols-2">
      <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#292929]">Hồ sơ chờ phê duyệt</h2>
        <ul className="mt-4 flex flex-col gap-3">
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E9E7] p-3">
            <div>
              <p className="whitespace-nowrap font-bold text-[#292929]">Nguyễn Hoàng Minh</p>
              <p className="whitespace-nowrap text-xs text-[#666666]">CDB-KH-3392 • CCCD + GPLX B2</p>
            </div>
            <StatusPill tone="warning">Chờ duyệt eKYC</StatusPill>
            <Link href={adminRoutes.users} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Duyệt eKYC →</Link>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E9E9E7] p-3">
            <div>
              <p className="whitespace-nowrap font-bold text-[#292929]">VinFast VF 9 Plus AWD</p>
              <p className="whitespace-nowrap text-xs text-[#666666]">51K-889.92 • Trần Đức Nam • CDB-VN-88492</p>
            </div>
            <StatusPill tone="warning">Chờ duyệt niêm yết</StatusPill>
            <Link href={adminRoutes.vehicles} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Thẩm định xe →</Link>
          </li>
        </ul>
      </article>
      <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#292929]">Đơn thuê mới nhất</h2>
          <Link href={adminRoutes.orders} className="whitespace-nowrap text-sm font-bold text-[#FC6C26]">Xem tất cả →</Link>
        </div>
        <ul className="mt-4 flex flex-col gap-3">
          {orders.map(order => {
                const money = calculatePayout(order);
                return <li key={order.id} className="rounded-xl border border-[#E9E9E7] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="whitespace-nowrap font-mono text-xs font-bold text-[#FC6C26]">{order.orderCode}</span>
                <StatusPill tone={orderTone[order.status]}>{orderLabel[order.status]}</StatusPill>
              </div>
              <p className="mt-1 whitespace-nowrap text-sm font-bold text-[#292929]">{order.carTitle}</p>
              <p className="whitespace-nowrap text-xs text-[#666666]">{order.renter} • {order.owner}</p>
              <p className="mt-1 whitespace-nowrap text-sm text-[#292929]"><Money amount={money.grossAmount}/> • phí 10% <Money amount={money.platformFee}/></p>
            </li>;
            })}
        </ul>
      </article>
    </section>
  </div>;
}

function Stat({ label, value, hint }) {
    return <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-[#666666]">{label}</p>
    <p className="mt-2 whitespace-nowrap text-2xl font-bold text-[#292929]">{value}</p>
    <p className="mt-1 text-xs text-[#666666]">{hint}</p>
  </article>;
}
