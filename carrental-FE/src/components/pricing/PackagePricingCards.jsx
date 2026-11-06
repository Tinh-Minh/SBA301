import { formatMoney } from "@/utils/labels.js";

export function PackagePricingCards({ packages }) {
    if (!packages?.length) return null;

    return <div className="grid gap-5 md:grid-cols-3">
      {packages.map(item => {
            const recommended = item.priorityLevel === 2;
            return <article key={item.id} className={`relative flex h-full flex-col rounded-2xl border bg-card-bg p-6 shadow-sm ${recommended ? "border-[#B9430C] ring-1 ring-[#B9430C]" : "border-border-light"}`}>
          {recommended ? <span className="absolute -top-3 left-5 rounded-full bg-[#B9430C] px-3 py-1 text-[11px] font-bold text-white">Được đề xuất</span> : null}
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-wide text-[#8F3208]">{item.badgeLabel || "Gói đăng tin"}</p><h2 className="mt-2 text-xl font-bold">{item.name}</h2></div>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-[#8F3208]">{item.durationDays} ngày</span>
          </div>
          <p className="mt-5 text-3xl font-bold tracking-tight">{formatMoney(item.price)}</p>
          <p className="mt-1 text-xs text-text-secondary">Giá cho một lần đăng tin</p>
          <p className="mt-5 flex-1 text-sm leading-relaxed text-text-secondary">{item.description || `Tin đăng được duy trì trong ${item.durationDays} ngày.`}</p>
          <div className="mt-6 border-t border-border-light pt-4 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Ưu tiên hiển thị:</span> {item.priorityLevel === 3 ? "VIP nổi bật" : item.priorityLevel === 2 ? "Nổi bật" : "Tiêu chuẩn"}
          </div>
        </article>;
        })}
    </div>;
}
