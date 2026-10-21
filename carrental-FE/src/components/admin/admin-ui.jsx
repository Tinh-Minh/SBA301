"use client";
import { useEffect } from "react";

const tones = {
    success: "bg-[#D1FAE5] text-[#047857]",
    warning: "bg-[#FEF3C7] text-[#B45309]",
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    info: "bg-blue-50 text-blue-800",
    neutral: "bg-[#F3F4F6] text-[#374151]",
};

export function StatusPill({ children, tone = "neutral" }) {
    return <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function AdminPageHeader({ code, title, description, actions }) {
    return <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      <p className="whitespace-nowrap text-[11px] font-bold uppercase tracking-wide text-[#666666]">Hệ thống quản trị / {code}</p>
      <h1 className="mt-1 text-2xl font-bold text-[#292929]">{title}</h1>
      {description ? <p className="mt-1 max-w-3xl text-sm text-[#666666]">{description}</p> : null}
    </div>
    {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
  </div>;
}

export function PrimaryButton({ children, onClick, type = "button", disabled = false }) {
    return <button type={type} onClick={onClick} disabled={disabled} className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-xl bg-[#FC6C26] px-4 py-3 text-sm font-bold text-white hover:bg-[#e05a18] disabled:opacity-60">{children}</button>;
}

export function AdminDialog({ title, children, onClose }) {
    useEffect(() => {
        function onKey(event) { if (event.key === "Escape") onClose(); }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292929]/40 p-4">
    <button type="button" aria-label="Đóng hộp thoại" className="absolute inset-0 cursor-default" onClick={onClose}/>
    <div role="dialog" aria-modal="true" aria-label={title} className="relative z-10 w-full max-w-md rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-xl">
      <h2 className="text-lg font-bold text-[#292929]">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  </div>;
}
