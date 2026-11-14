export const orderTone = { CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", PENDING: "warning", CANCELLED: "danger", REJECTED: "danger", EXPIRED: "neutral" };

export function Stat({ label, value, hint }) {
    return <article className="rounded-2xl border border-[#E4E2D8] bg-white p-5 shadow-sm">
    <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-widest text-[#6C6C61]">{label}</p>
    <p className="mt-2 whitespace-nowrap text-2xl font-extrabold tabular-nums text-[#25251F]">{value}</p>
    <p className="mt-1 text-xs text-[#5C584F]">{hint}</p>
  </article>;
}
