import { useState } from "react";
import { formatMoney } from "@/utils/labels.js";
import { packageTitle } from "@/utils/text.js";

const priorityLabel = {
    3: "VIP PRO nổi bật đầu sàn",
    2: "Nổi bật trên danh sách",
    1: "Tiêu chuẩn",
};

export function PackagePricingCards({ packages }) {
    const [openIds, setOpenIds] = useState(() => new Set());
    if (!packages?.length) return null;

    const toggle = (id) => setOpenIds(current => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
    });

    return <div className="grid items-start gap-5 md:grid-cols-3">
      {packages.map(item => {
            const recommended = item.priorityLevel === 2;
            const slotCount = item.slotCount || (item.code === "PKG_BASIC" ? 3 : item.code === "PKG_STANDARD" ? 5 : item.code === "PKG_VIP" ? 10 : 1);
            const slotDays = item.durationDaysPerSlot || (item.code === "PKG_BASIC" ? 3 : item.code === "PKG_STANDARD" ? 7 : item.code === "PKG_VIP" ? 15 : Math.round(item.durationDays / slotCount));
            const totalDays = item.durationDays || slotCount * slotDays;
            const costPerDay = Math.round(item.price / totalDays);
            const open = openIds.has(item.id);
            const panelId = `package-detail-${item.id}`;

            return <article key={item.id} className={`relative flex flex-col rounded-2xl border bg-card-bg p-5 shadow-sm ${recommended ? "border-[#B9430C] ring-1 ring-[#B9430C]" : "border-border-light"}`}>
          <div className="mb-3 flex h-6 items-center">
            {recommended ? <span className="rounded-full bg-[#B9430C] px-3 py-1 text-[11px] font-bold text-white">Được đề xuất nhiều nhất</span> : null}
          </div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#8F3208]">{item.badgeLabel || "Gói đăng tin"}</p>
          <h2 className="mt-2 text-lg font-bold leading-snug text-[#292929]">{packageTitle(item)}</h2>
          <p className="mt-4 text-3xl font-bold tracking-tight text-[#292929]">{formatMoney(item.price)}</p>
          <p className="mt-1 text-sm text-text-secondary">{slotCount} lượt đăng · {slotDays} ngày/lượt</p>
          <button type="button" className="mt-4 self-start text-sm font-bold text-[#B9430C] underline-offset-4 hover:underline focus-visible:outline-[#B9430C]" aria-expanded={open} aria-controls={panelId} onClick={() => toggle(item.id)}>
            {open ? "Thu gọn" : "Xem chi tiết"}
          </button>
          {open ? <div id={panelId} className="mt-4 border-t border-border-light pt-4">
            <ul className="flex flex-col gap-2 text-sm text-text-secondary">
              <li>{slotCount} lượt đăng cho 1 xe</li>
              <li>{slotDays} ngày mỗi lượt, bật tắt khi xe rảnh</li>
              <li>Tổng thời gian hiển thị: {totalDays} ngày</li>
              <li>Ưu tiên hiển thị: {priorityLabel[item.priorityLevel] || "Tiêu chuẩn"}</li>
              <li>Khoảng {formatMoney(costPerDay)} mỗi ngày</li>
            </ul>
            {item.description ? <p className="mt-3 text-sm leading-relaxed text-text-secondary">{item.description}</p> : null}
          </div> : null}
        </article>;
        })}
    </div>;
}
