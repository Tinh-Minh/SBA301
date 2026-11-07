import { Link } from "react-router";
import { ownerRoutes } from "@/routes/paths.js";

const buyLink = "inline-flex items-center rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-bold text-white";

/** Trạng thái tin đăng của một xe đã duyệt: đang hiển thị, chưa đăng hoặc đã hết hạn. */
export function ListingStatusBar({ car, subscriptions }) {
    if (car.status !== "ACTIVE")
        return null;
    const mine = subscriptions.filter(subscription => subscription.carId === car.id);
    const active = mine.find(subscription => subscription.status === "ACTIVE");
    const pending = mine.find(subscription => subscription.status === "PENDING_PAYMENT");
    const buyHref = `${ownerRoutes.subscriptionNew}?carId=${car.id}`;
    let content;
    if (active)
        content = <span className="font-semibold text-[#047857]">🟢 Đang hiển thị • Còn {active.daysRemaining} ngày hiển thị</span>;
    else if (pending)
        content = <>
      <span className="font-semibold text-[#B45309]">🟡 Đang chờ thanh toán gói {pending.packageName}</span>
      <Link to={ownerRoutes.subscriptions} className={buyLink}>Xem yêu cầu</Link>
    </>;
    else if (car.listingStatus === "EXPIRED")
        content = <>
      <span className="font-semibold text-[#B91C1C]">🔴 Tin đã hết hạn</span>
      <Link to={buyHref} className={buyLink}>Gia hạn ngay</Link>
    </>;
    else
        content = <>
      <span className="font-semibold text-[#B45309]">🟡 Chưa đăng bài</span>
      <Link to={buyHref} className={buyLink}>Mua gói đăng tin</Link>
    </>;
    return <div data-testid="listing-status" className="flex flex-wrap items-center gap-3 rounded-xl bg-section-bg px-3 py-2 text-sm">{content}</div>;
}
