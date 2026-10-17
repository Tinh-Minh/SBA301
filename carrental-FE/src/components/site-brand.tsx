import Link from "next/link";

export function SiteBrand({ onClick, compact = false }: { onClick?: () => void; compact?: boolean }) {
  return <Link href="/" aria-label="CarDB — Trang chủ" onClick={onClick} className="inline-flex shrink-0 items-center gap-1.5">
    <span className="text-2xl font-black tracking-tight text-text-primary">Car<span className="text-brand-accent">DB</span></span>
    <span className={`ml-2 flex-col border-l border-border-light pl-3 text-[9px] font-semibold uppercase leading-none tracking-wider text-text-secondary ${compact ? "hidden sm:flex" : "flex"}`}>
      <span className="text-[10px] font-bold tracking-widest">Di chuyển</span><span className="mt-1">Cao cấp</span>
    </span>
  </Link>;
}
