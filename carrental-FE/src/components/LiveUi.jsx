export function LivePage({ children, width = "max-w-6xl" }) {
    return <main data-native className="w-full pt-24 pb-16">
    <div className={`mx-auto w-full px-4 sm:px-6 ${width}`}>{children}</div>
  </main>;
}

export const fieldClass = "w-full rounded-xl border border-[#D2CFC3] bg-[#F8F7F3] px-3.5 py-2.5 text-sm font-medium text-[#25251F] transition focus:border-[#FC6C26] focus:bg-white focus:outline-none";

export function LiveState({ loading, error, empty, label = "dữ liệu", onRetry }) {
    if (loading)
        return <p className="rounded-2xl border border-[#E4E2D8] bg-white p-6 text-sm font-medium text-[#5C584F]">Đang tải {label}…</p>;
    if (error)
        return <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C]">
      <span>{error.message}</span>
      {onRetry ? <button type="button" onClick={onRetry} className="font-bold underline">Thử lại</button> : null}
    </div>;
    if (empty)
        return <p className="rounded-2xl border border-[#E4E2D8] bg-white p-6 text-sm text-[#5C584F]">Chưa có {label}.</p>;
    return null;
}

export function Primary({ children, disabled, type = "button", onClick }) {
    return <button type={type} disabled={disabled} onClick={onClick} className="inline-flex items-center justify-center rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#25251F] disabled:opacity-60">{children}</button>;
}

export function Pill({ children, className = "" }) {
    return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${className}`}>{children}</span>;
}
