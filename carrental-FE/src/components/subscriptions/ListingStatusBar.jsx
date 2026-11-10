import { Link } from "react-router";
import { useState } from "react";
import { ownerRoutes } from "@/routes/paths.js";
import { subscriptionService } from "@/services/subscriptionService.js";

const buyLink = "inline-flex items-center rounded-lg bg-brand-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90";
const actionBtn = "inline-flex items-center rounded-lg bg-[#047857] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#065F46] disabled:opacity-50";

/** Trạng thái tin đăng của một xe đã duyệt: đang hiển thị, chưa đăng hoặc đã hết hạn. */
export function ListingStatusBar({ car, subscriptions, onReload }) {
    if (car.status !== "ACTIVE")
        return null;
    const mine = (subscriptions || []).filter(subscription => subscription.carId === car.id);
    const active = mine.find(subscription => subscription.status === "ACTIVE");
    const pending = mine.find(subscription => subscription.status === "PENDING_PAYMENT");
    const buyHref = `${ownerRoutes.subscriptionNew}?carId=${car.id}`;
    const [activating, setActivating] = useState(false);
    const [msg, setMsg] = useState("");

    async function handleActivateSlot() {
        if (!active) return;
        setActivating(true);
        setMsg("");
        try {
            await subscriptionService.activateSlot(active.id);
            setMsg("Kích hoạt slot thành công!");
            if (onReload) onReload();
            else window.location.reload();
        } catch (e) {
            setMsg(e.message || "Không thể kích hoạt slot");
        } finally {
            setActivating(false);
        }
    }

    let content;
    if (active) {
        const totalSlots = active.totalSlots || 1;
        const remainingSlots = active.remainingSlots ?? 0;
        const slotDays = active.durationDaysPerSlot || 7;

        if (car.listingStatus === "LISTED") {
            content = <>
                <span className="font-semibold text-[#047857]">
                    🟢 Đang hiển thị • Còn {active.daysRemaining ?? slotDays} ngày (Slot {totalSlots - remainingSlots}/{totalSlots})
                </span>
                {remainingSlots > 0 && (
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-[#047857]">
                        Còn {remainingSlots} slots dự trữ
                    </span>
                )}
            </>;
        } else {
            content = <>
                <span className="font-semibold text-[#B45309]">
                    ⏸️ Tạm ẩn tin • Còn {remainingSlots}/{totalSlots} slots ({slotDays} ngày/slot)
                </span>
                {remainingSlots > 0 ? (
                    <button
                        type="button"
                        disabled={activating}
                        onClick={handleActivateSlot}
                        className={actionBtn}
                    >
                        {activating ? "Đang kích hoạt…" : `⚡ Kích hoạt slot tiếp theo (${slotDays} ngày)`}
                    </button>
                ) : (
                    <Link to={buyHref} className={buyLink}>Mua gói mới</Link>
                )}
            </>;
        }
    } else if (pending) {
        content = <>
            <span className="font-semibold text-[#B45309]">🟡 Đang chờ thanh toán gói {pending.packageName}</span>
            <Link to={ownerRoutes.subscriptions} className={buyLink}>Xem yêu cầu</Link>
        </>;
    } else if (car.listingStatus === "EXPIRED") {
        content = <>
            <span className="font-semibold text-[#B91C1C]">🔴 Tin đã hết hạn</span>
            <Link to={buyHref} className={buyLink}>Gia hạn ngay</Link>
        </>;
    } else {
        content = <>
            <span className="font-semibold text-[#B45309]">🟡 Chưa đăng bài</span>
            <Link to={buyHref} className={buyLink}>Mua gói đăng tin</Link>
        </>;
    }

    return (
        <div data-testid="listing-status" className="flex flex-wrap items-center gap-3 rounded-xl bg-section-bg px-3 py-2 text-sm">
            {content}
            {msg && <span className="text-xs font-semibold text-[#047857]">{msg}</span>}
        </div>
    );
}
