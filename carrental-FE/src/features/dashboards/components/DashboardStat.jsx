

export const orderTone = { CONFIRMED: "info", ONGOING: "success", COMPLETED: "neutral", PENDING: "warning", CANCELLED: "danger", REJECTED: "danger", EXPIRED: "neutral" };

export function Stat({ label, value, hint }) {
    return <article className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
    <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-[#666666]">{label}</p>
    <p className="mt-2 whitespace-nowrap text-2xl font-bold text-[#292929]">{value}</p>
    <p className="mt-1 text-xs text-[#666666]">{hint}</p>
  </article>;
}
