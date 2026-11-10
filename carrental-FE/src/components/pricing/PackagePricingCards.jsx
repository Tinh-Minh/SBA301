import { formatMoney } from "@/utils/labels.js";

export function PackagePricingCards({ packages }) {
    if (!packages?.length) return null;

    return <div className="grid gap-5 md:grid-cols-3">
      {packages.map(item => {
            const recommended = item.priorityLevel === 2;
            const slotCount = item.slotCount || (item.code === "PKG_BASIC" ? 3 : item.code === "PKG_STANDARD" ? 5 : item.code === "PKG_VIP" ? 10 : 1);
            const slotDays = item.durationDaysPerSlot || (item.code === "PKG_BASIC" ? 3 : item.code === "PKG_STANDARD" ? 7 : item.code === "PKG_VIP" ? 15 : Math.round(item.durationDays / slotCount));
            const costPerDay = Math.round(item.price / (item.durationDays || (slotCount * slotDays)));

            return <article key={item.id} className={`relative flex h-full flex-col rounded-2xl border bg-card-bg p-6 shadow-sm transition hover:shadow-md ${recommended ? "border-[#B9430C] ring-1 ring-[#B9430C]" : "border-border-light"}`}>
          {recommended ? <span className="absolute -top-3 left-5 rounded-full bg-[#B9430C] px-3 py-1 text-[11px] font-bold text-white shadow-sm">Được đề xuất nhiều nhất</span> : null}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#8F3208]">{item.badgeLabel || "Gói đăng tin"}</p>
              <h2 className="mt-2 text-xl font-bold">{item.name}</h2>
            </div>
            <span className="shrink-0 whitespace-nowrap rounded-full bg-accent-soft px-3 py-1 text-xs font-bold text-[#8F3208]">
              {slotCount} slots × {slotDays} ngày
            </span>
          </div>
          <p className="mt-5 text-3xl font-bold tracking-tight text-[#292929]">{formatMoney(item.price)}</p>
          <p className="mt-1 text-xs text-text-secondary">~{formatMoney(costPerDay)}/ngày • Tổng {item.durationDays} ngày hiển thị</p>

          <ul className="mt-4 flex flex-col gap-2 rounded-xl bg-[#F9F9F8] p-3 text-xs text-text-secondary">
            <li className="flex items-center gap-1.5"><span className="text-[#047857] font-bold">✓</span> <strong>{slotCount} lượt đăng (slots)</strong> dành cho 1 xe</li>
            <li className="flex items-center gap-1.5"><span className="text-[#047857] font-bold">✓</span> <strong>{slotDays} ngày/slot</strong> (bật/tắt linh hoạt khi rảnh xe)</li>
            <li className="flex items-center gap-1.5"><span className="text-[#047857] font-bold">✓</span> Tổng thời gian hiển thị: <strong>{item.durationDays} ngày</strong></li>
          </ul>

          <p className="mt-4 flex-1 text-sm leading-relaxed text-text-secondary">{item.description || `Phù hợp cho chủ xe kích hoạt theo từng đợt rảnh xe.`}</p>
          <div className="mt-6 border-t border-border-light pt-4 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">Ưu tiên hiển thị:</span> {item.priorityLevel === 3 ? "VIP PRO nổi bật đầu sàn" : item.priorityLevel === 2 ? "Nổi bật trên danh sách" : "Tiêu chuẩn"}
          </div>
        </article>;
        })}
    </div>;
}
