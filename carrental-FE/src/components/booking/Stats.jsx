import { formatMoney } from "@/utils/labels.js";

export function StatCard({ label, value, hint, tone = "default" }) {
    const color = tone === "brand" ? "text-[#FC6C26]" : tone === "good" ? "text-[#047857]" : tone === "warn" ? "text-[#B45309]" : "text-[#25251F]";
    return <div className="rounded-2xl border border-[#E4E2D8] bg-white p-5 shadow-sm">
    <p className="text-[11px] font-bold uppercase tracking-widest text-[#6C6C61]">{label}</p>
    <p className={`mt-1.5 text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
    {hint ? <p className="mt-1 text-xs text-[#6C6C61]">{hint}</p> : null}
  </div>;
}

/** Biểu đồ cột 6 tháng (doanh thu/chi tiêu từ đơn hoàn tất). */
export function MonthlyBars({ points, label = "Doanh thu" }) {
    const max = Math.max(1, ...points.map(p => Number(p.revenue)));
    return <figure className="rounded-2xl border border-[#E4E2D8] bg-white p-5 shadow-sm">
    <figcaption className="text-xs font-bold uppercase tracking-widest text-[#6C6C61]">{label} 6 tháng gần nhất</figcaption>
    <div className="mt-4 flex items-end gap-3">{points.map(p => <div key={p.month} className="flex flex-1 flex-col items-center gap-1.5" title={`${p.month}: ${formatMoney(p.revenue)} • ${p.bookings} chuyến`}>
      <span className="text-[10px] font-bold tabular-nums text-[#5C584F]">{Number(p.revenue) ? `${Math.round(Number(p.revenue) / 100000) / 10}tr` : ""}</span>
      <div className="flex h-24 w-full items-end rounded-lg bg-[#FAF9F5] p-1"><div className="w-full rounded-md bg-[#FC6C26]" style={{ height: `${Math.max(6, (Number(p.revenue) / max) * 100)}%`, opacity: Number(p.revenue) ? 1 : 0.18 }}/></div>
      <span className="font-mono text-[10px] font-semibold text-[#6C6C61]">{p.month.split("/")[0]}/{p.month.split("/")[1].slice(2)}</span>
    </div>)}</div>
  </figure>;
}
