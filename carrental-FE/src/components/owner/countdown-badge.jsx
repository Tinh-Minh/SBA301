"use client";
import { useCountdown } from "@/hooks/use-countdown";
import { Icon } from "../icon";
const URGENT_MS = 30 * 60 * 1000;
export function CountdownBadge({ deadline }) {
    const countdown = useCountdown(deadline);
    const tone = !countdown ? "bg-badge-gray text-charcoal" : countdown.expired ? "bg-error-container text-on-error-container" : countdown.remainingMs <= URGENT_MS ? "bg-status-amber-bg text-amber-800" : "bg-accent-soft text-on-primary-fixed-variant";
    return <span role="timer" aria-live="off" className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold tabular-nums leading-5 ${tone}`}>
    <Icon name="timer" className="text-[14px]"/>
    {countdown ? (countdown.expired ? "Hết hạn phản hồi" : countdown.label) : "--:--:--"}
  </span>;
}
