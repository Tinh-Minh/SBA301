import { formatVnd } from "@/lib/owner/finance";

export function Money({ amount, sign, className = "" }: { amount: number; sign?: "+" | "-"; className?: string }) {
  return <span className={`ui-money ${className}`}>{sign ? `${sign} ` : ""}{formatVnd(amount)}</span>;
}
