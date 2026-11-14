import { useEffect } from "react";

const tones = {
    success: "bg-[#D1FAE5] text-[#047857]",
    warning: "bg-[#FEF3C7] text-[#B45309]",
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    info: "bg-blue-50 text-blue-800",
    neutral: "bg-[#EAE8E0] text-[#374151]",
};

export function StatusPill({ children, tone = "neutral" }) {
    return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function AdminPageHeader({ code, title, description, actions }) {
    return <div className="editorial-hero-banner flex flex-col gap-3 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
    <div className="min-w-0">
      <p className="editorial-kicker whitespace-nowrap">Hệ thống quản trị / {code}</p>
      <h1 className="mt-1.5 text-2xl font-extrabold text-[#25251F]">{title}</h1>
      {description ? <p className="mt-1 max-w-3xl text-sm text-[#5C584F]">{description}</p> : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
  </div>;
}

export function PrimaryButton({ children, onClick, type = "button", disabled = false }) {
    return <button type={type} onClick={onClick} disabled={disabled} className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-[#FC6C26] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#25251F] disabled:opacity-60">{children}</button>;
}

export const adminInput = "w-full rounded-xl border border-[#D2CFC3] bg-[#F8F7F3] px-3.5 py-2.5 text-sm font-medium text-[#25251F]";

export function AdminState({ loading, error, empty, label = "dữ liệu", onRetry }) {
    if (loading)
        return <p className="rounded-2xl border border-[#E4E2D8] bg-white p-6 text-sm text-[#5C584F]">Đang tải {label}…</p>;
    if (error)
        return <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-5 text-sm text-[#B91C1C]">
      <span>{error.message}</span>
      {onRetry ? <button type="button" onClick={onRetry} className="font-bold underline">Thử lại</button> : null}
    </div>;
    if (empty)
        return <p className="rounded-2xl border border-[#E4E2D8] bg-white p-6 text-sm text-[#5C584F]">Chưa có {label}.</p>;
    return null;
}

export function Pager({ page, totalPages, onPage }) {
    if (!totalPages || totalPages <= 1)
        return null;
    return <div className="flex items-center justify-end gap-2 text-sm">
    <button type="button" disabled={page <= 0} onClick={() => onPage(page - 1)} className="rounded-xl border border-[#D6D3CB] bg-white px-3.5 py-1.5 font-bold text-[#25251F] disabled:opacity-40">‹ Trước</button>
    <span className="font-medium text-[#5C584F]">Trang {page + 1}/{totalPages}</span>
    <button type="button" disabled={page + 1 >= totalPages} onClick={() => onPage(page + 1)} className="rounded-xl border border-[#D6D3CB] bg-white px-3.5 py-1.5 font-bold text-[#25251F] disabled:opacity-40">Sau ›</button>
  </div>;
}

export function Tabs({ items, value, onChange }) {
    return <div className="flex flex-wrap gap-2">
    {items.map(item => <button key={item.id} type="button" onClick={() => onChange(item.id)} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold transition-all ${value === item.id ? "bg-[#25251F] text-white shadow-sm" : "border border-[#D6D3CB] bg-white text-[#25251F] hover:border-[#FC6C26]"}`}>{item.label}</button>)}
  </div>;
}

export function AdminDialog({ title, children, onClose }) {
    useEffect(() => {
        function onKey(event) { if (event.key === "Escape") onClose(); }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#25251F]/40 p-4 backdrop-blur-xs">
    <button type="button" aria-label="Đóng hộp thoại" className="absolute inset-0 cursor-default" onClick={onClose}/>
    <div role="dialog" aria-modal="true" aria-label={title} className="relative z-10 w-full max-w-md rounded-2xl border border-[#E4E2D8] bg-white p-6 shadow-xl">
      <h2 className="text-lg font-extrabold text-[#25251F]">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  </div>;
}
