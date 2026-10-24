import { formatTrVnd, formatVnd } from "@/shared/utils/owner.js";
export function Money({ amount, sign, compact = false, className = "" }) {
    const text = compact ? formatTrVnd(amount) : formatVnd(amount);
    return <span className={`ui-money ${className}`}>{sign ? `${sign} ` : ""}{text}</span>;
}
