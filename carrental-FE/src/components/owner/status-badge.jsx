import { toneClasses } from "@/lib/owner/status";
export function StatusBadge({ meta, className = "" }) {
    return <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold leading-5 ${toneClasses[meta.tone]} ${className}`}>
    <span aria-hidden="true" className="size-1.5 rounded-full bg-current"/>
    {meta.label}
  </span>;
}
