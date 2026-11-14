import { useState } from "react";
import { Link } from "react-router";
import { LivePage, LiveState } from "@/components/LiveUi.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { MonthlyBars, StatCard } from "@/components/booking/Stats.jsx";
import { TripCard, nextAction } from "@/components/booking/TripParts.jsx";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { tripService } from "@/services/tripService.js";
import { formatMoney } from "@/utils/labels.js";

const tabs = [
    { id: "all", label: "Tất cả", match: () => true },
    { id: "upcoming", label: "Sắp tới", match: b => ["REQUESTED", "CONFIRMED"].includes(b.status) },
    { id: "active", label: "Đang thuê", match: b => ["PICKUP_PENDING", "IN_PROGRESS", "RETURN_PENDING"].includes(b.status) },
    { id: "done", label: "Hoàn tất", match: b => b.status === "COMPLETED" },
    { id: "closed", label: "Đã huỷ / từ chối", match: b => ["CANCELLED", "REJECTED", "EXPIRED"].includes(b.status) },
];

function Trips() {
    const dash = useApiQuery(["dashboard", "customer"], tripService.customerDashboard);
    const [tab, setTab] = useState("all");
    const d = dash.data;
    if (!d) return <LiveState loading={dash.loading} error={dash.error} label="chuyến đi" onRetry={dash.reload}/>;
    const list = d.bookings.filter(tabs.find(t => t.id === tab).match);
    return <div className="flex flex-col gap-6">
    <header className="editorial-hero-banner flex flex-wrap items-end justify-between gap-4 p-6 sm:p-8">
      <div>
        <span className="editorial-kicker">Hành trình của bạn</span>
        <h1 className="mt-2 text-2xl font-extrabold text-[#25251F] sm:text-3xl">Chuyến đi của tôi</h1>
        <p className="mt-1 text-sm text-[#5C584F]">Theo dõi mọi đơn thuê, biên bản bàn giao và chi phí.</p>
      </div>
      <Link to="/explore" className="rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white shadow-sm">Thuê xe mới ↗</Link>
    </header>

    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Sắp tới" value={d.upcomingBookings} hint="Chờ xác nhận / đã xác nhận"/>
      <StatCard label="Đang thuê" value={d.activeBookings} tone={d.activeBookings ? "brand" : "default"} hint={Number(d.depositsHeld) ? `Đang đặt cọc ${formatMoney(d.depositsHeld)}` : "Không có cọc đang giữ"}/>
      <StatCard label="Đã hoàn tất" value={d.completedBookings} hint={`${d.rentedHours} giờ lái • ${d.cancelledBookings} đơn huỷ/từ chối`} tone="good"/>
      <StatCard label="Tổng chi tiêu" value={formatMoney(d.totalSpent)} hint="Từ các chuyến đã hoàn tất"/>
    </div>

    {d.actionNeeded.length ? <section className="flex flex-col gap-2.5 rounded-2xl border border-[#FDBA8C] bg-[#FFF7F2] p-5">
      <h2 className="text-sm font-extrabold text-[#9A3412]">Cần bạn xử lý ({d.actionNeeded.length})</h2>
      {d.actionNeeded.map(b => <TripCard key={b.id} booking={b} role="customer" highlight={nextAction(b, "customer")}/>)}
    </section> : null}

    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="flex flex-col gap-3.5">
        <div className="flex flex-wrap gap-2">{tabs.map(t => <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${tab === t.id ? "bg-[#25251F] text-white shadow-sm" : "border border-[#D6D3CB] bg-white text-[#25251F] hover:border-[#FC6C26]"}`}>{t.label} ({d.bookings.filter(t.match).length})</button>)}</div>
        {list.length ? list.map(b => <TripCard key={b.id} booking={b} role="customer" highlight={nextAction(b, "customer")}/>) : <p className="rounded-2xl border border-[#E4E2D8] bg-white p-8 text-center text-sm text-[#5C584F]">Chưa có chuyến nào trong mục này.</p>}
      </section>
      <MonthlyBars points={d.monthly} label="Chi tiêu thuê xe"/>
    </div>
  </div>;
}

export default function MyTripsPage() {
    return <LivePage><RequireAuth title="Đăng nhập để xem chuyến đi"><Trips/></RequireAuth></LivePage>;
}
