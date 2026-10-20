import { formatVnd } from "@/lib/owner/finance";
export function Money({ amount, sign, className = "" }) {
    return <span className={`ui-money ${className}`}>{sign ? `${sign} ` : ""}{formatVnd(amount)}</span>;
}
