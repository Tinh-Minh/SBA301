export function SummaryCard({ label, value, hint, compact = false }) {
    return <div className="rounded-2xl border border-card-border bg-white p-4 shadow-sm">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-gray">{label}</p>
        <p className={`mt-1 ${compact ? "text-xl" : "text-2xl"} font-bold text-charcoal`}>{value}</p>
        <p className="text-xs text-muted-gray">{hint}</p>
    </div>;
}
