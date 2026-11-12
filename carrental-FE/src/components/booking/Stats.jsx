import { formatMoney } from "@/utils/labels.js";

export function StatCard({ label, value, hint, tone = "default" }) {
    const color = tone === "brand" ? "text-[#FC6C26]" : tone === "good" ? "text-[#047857]" : tone === "warn" ? "text-[#B45309]" : "text-[#292929]";
    return <div className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-wide text-[#666666]">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    {hint ? <p className="mt-0.5 text-xs text-[#666666]">{hint}</p> : null}
  </div>;
}

/** Biểu đồ cột 6 tháng (doanh thu/chi tiêu từ đơn hoàn tất). */
export function MonthlyBars({ points, label = "Doanh thu" }) {
    const max = Math.max(1, ...points.map(p => Number(p.revenue)));
    return <figure className="rounded-2xl border border-[#E9E9E7] bg-white p-4 shadow-sm">
    <figcaption className="text-sm font-bold text-[#292929]">{label} 6 tháng gần nhất</figcaption>
    <div className="mt-3 flex items-end gap-3">{points.map(p => <div key={p.month} className="flex flex-1 flex-col items-center gap-1" title={`${p.month}: ${formatMoney(p.revenue)} • ${p.bookings} chuyến`}>
      <span className="text-[10px] text-[#666666]">{Number(p.revenue) ? `${Math.round(Number(p.revenue) / 100000) / 10}tr` : ""}</span>
      <div className="flex h-24 w-full items-end"><div className="w-full rounded-t-md bg-[#FC6C26]" style={{ height: `${Math.max(3, (Number(p.revenue) / max) * 100)}%`, opacity: Number(p.revenue) ? 1 : 0.15 }}/></div>
      <span className="text-[10px] text-[#666666]">{p.month.split("/")[0]}/{p.month.split("/")[1].slice(2)}</span>
    </div>)}</div>
  </figure>;
}
