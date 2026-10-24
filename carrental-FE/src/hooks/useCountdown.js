import { useEffect, useState } from "react";
const pad = (value) => String(value).padStart(2, "0");
export function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${pad(hours)}:${pad(minutes)}:${pad(totalSeconds % 60)}`;
}
/** Đếm ngược tới `deadline` (ISO). Trả `null` trước khi mount để tránh lệch hydrate. */
export function useCountdown(deadline) {
    const [now, setNow] = useState(null);
    useEffect(() => {
        if (!deadline)
            return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [deadline]);
    if (!deadline || now === null)
        return null;
    const remainingMs = Math.max(0, Date.parse(deadline) - now);
    return { remainingMs, expired: remainingMs === 0, label: formatDuration(remainingMs) };
}
