import { useMemo, useState } from "react";
import { Link } from "react-router";
import { OwnerCrumb, OwnerHeading } from "@/components/owner/OwnerScreen.jsx";
import { LiveState } from "@/components/LiveUi.jsx";
import { useMySubscriptions } from "@/hooks/useSubscriptions.js";
import { ownerRoutes } from "@/routes/paths.js";
import { formatDate, parseDate } from "@/utils/datetime.js";
import { subscriptionStatusMeta } from "@/services/subscriptionService.js";
import { StatusBadge } from "@/components/owner/StatusBadge.jsx";

const dayOf = date => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

function within(from, to, date) {
    const start = parseDate(from);
    const end = parseDate(to);
    if (!start || !end)
        return false;
    const day = dayOf(date);
    return day >= dayOf(start) && day <= dayOf(end);
}

/**
 * Tin chỉ thực sự hiển thị trong SLOT đang chạy (currentSlotStartDate → currentSlotEndDate).
 * Phần còn lại của thời hạn gói chỉ là "còn slot dự trữ": xe ẩn cho tới khi chủ xe kích hoạt slot kế tiếp.
 *
 * @returns "listed" | "reserve" | null
 */
function coverage(subscription, date) {
    if (subscription.status !== "ACTIVE")
        return null;
    if (within(subscription.currentSlotStartDate ?? subscription.startDate, subscription.currentSlotEndDate, date))
        return "listed";
    const afterSlot = subscription.currentSlotEndDate && dayOf(date) > dayOf(parseDate(subscription.currentSlotEndDate));
    if ((subscription.remainingSlots ?? 0) > 0 && afterSlot && within(subscription.startDate, subscription.endDate, date))
        return "reserve";
    return null;
}

export default function OwnerCalendar() {
    const today = new Date();
    const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
    const { data, loading, error, reload } = useMySubscriptions();
    const subscriptions = data ?? [];
    const grid = useMemo(() => {
        const first = new Date(cursor.year, cursor.month, 1);
        const lead = (first.getDay() + 6) % 7;
        const days = new Date(cursor.year, cursor.month + 1, 0).getDate();
        const cells = Array.from({ length: lead }, () => null);
        for (let day = 1; day <= days; day += 1)
            cells.push(new Date(cursor.year, cursor.month, day));
        while (cells.length % 7 !== 0)
            cells.push(null);
        return cells;
    }, [cursor]);
    const label = new Date(cursor.year, cursor.month, 1).toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
    return <div className="flex min-w-0 flex-col gap-6">
    <div className="flex flex-col gap-2">
      <OwnerCrumb homeHref={ownerRoutes.dashboard} current="Lịch hiển thị"/>
      <OwnerHeading title="Lịch hiển thị tin" description="Xe chỉ hiển thị trên sàn trong slot đang chạy. Những ngày còn lại của gói là slot dự trữ, cần kích hoạt mới hiển thị tiếp."/>
    </div>
    <LiveState loading={loading && !data} error={error} empty={!!data && subscriptions.length === 0} label="gói đăng tin" onRetry={reload}/>
    <div className="flex items-center justify-between">
      <button type="button" onClick={() => setCursor(current => ({ year: current.month === 0 ? current.year - 1 : current.year, month: current.month === 0 ? 11 : current.month - 1 }))} className="rounded-lg border border-[#E9E9E7] px-3 py-1.5 text-sm font-bold">Tháng trước</button>
      <strong className="capitalize">{label}</strong>
      <button type="button" onClick={() => setCursor(current => ({ year: current.month === 11 ? current.year + 1 : current.year, month: current.month === 11 ? 0 : current.month + 1 }))} className="rounded-lg border border-[#E9E9E7] px-3 py-1.5 text-sm font-bold">Tháng sau</button>
    </div>
    <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#666666]">
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-6 rounded bg-[#FC6C26]"/>Đang hiển thị (slot đang chạy)</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-3 w-6 rounded border border-dashed border-[#FDBA8C]"/>Slot dự trữ, chưa kích hoạt</span>
    </p>
    <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-[#666666]">{["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map(day => <span key={day}>{day}</span>)}</div>
    <div className="grid grid-cols-7 gap-1">
      {grid.map((date, index) => {
        const listed = date ? subscriptions.map(item => ({ item, kind: coverage(item, date) })).filter(entry => entry.kind) : [];
        return <div key={index} className={`min-h-16 rounded-lg border p-1 text-xs ${date ? "border-[#E9E9E7] bg-white" : "border-transparent"}`}>
          {date ? <span className="font-bold">{date.getDate()}</span> : null}
          {listed.slice(0, 3).map(({ item, kind }) => <p key={item.id} title={kind === "listed" ? "Đang hiển thị trên sàn" : "Còn slot dự trữ, cần kích hoạt để hiển thị"} className={`mt-1 truncate rounded px-1 text-[10px] ${kind === "listed" ? "bg-[#FC6C26] font-bold text-white" : "border border-dashed border-[#FDBA8C] text-[#9A3412]"}`}>{item.licensePlate}</p>)}
        </div>;
      })}
    </div>
    <ul className="flex flex-col gap-2">{subscriptions.filter(item => item.status === "ACTIVE" || item.status === "PENDING_PAYMENT").map(item => <li key={item.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E9E9E7] bg-white p-4 text-sm">
      <span>{item.carName} • {item.packageName}<span className="block text-xs text-[#666666]">{item.status === "ACTIVE" ? `Slot hiện tại: ${formatDate(item.currentSlotStartDate ?? item.startDate)} – ${formatDate(item.currentSlotEndDate)} • còn ${item.remainingSlots ?? 0} slot dự trữ` : `${formatDate(item.startDate)} – ${formatDate(item.endDate)}`}</span></span>
      <span className="flex items-center gap-2"><StatusBadge meta={subscriptionStatusMeta[item.status]}/><Link to={`${ownerRoutes.subscriptions}/${item.id}`} className="font-bold text-[#FC6C26]">Chi tiết</Link></span>
    </li>)}</ul>
  </div>;
}
