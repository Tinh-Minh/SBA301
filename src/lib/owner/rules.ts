import type { OrderHandover, RentalOrder } from "@/interfaces";

export const OWNER_RESPONSE_WINDOW_MS = 2 * 60 * 60 * 1000;

export function isOrderExpired(order: Pick<RentalOrder, "status" | "expiresAt">, now = Date.now()) {
  return order.status === "PENDING" && !!order.expiresAt && Date.parse(order.expiresAt) <= now;
}

export function canRespondToOrder(order: Pick<RentalOrder, "status" | "expiresAt">, now = Date.now()) {
  return order.status === "PENDING" && !isOrderExpired(order, now);
}

export function isHandoverConfirmed(handover?: Pick<OrderHandover, "ownerConfirmedAt" | "renterConfirmedAt">) {
  return !!handover?.ownerConfirmedAt && !!handover.renterConfirmedAt;
}

export function findHandover(handovers: readonly OrderHandover[], type: OrderHandover["handoverType"]) {
  return handovers.find(handover => handover.handoverType === type);
}

/** C10-A phải được cả hai bên xác nhận trước khi lập C10-B. */
export function nextHandoverType(handovers: readonly OrderHandover[]): OrderHandover["handoverType"] | null {
  const pickup = findHandover(handovers, "PICKUP");
  if (!isHandoverConfirmed(pickup)) return "PICKUP";
  return isHandoverConfirmed(findHandover(handovers, "RETURN")) ? null : "RETURN";
}

/** Payout chuyển từ PENDING sang PAID chỉ khi C10-B được cả chủ xe và người thuê xác nhận. */
export function isPayoutReleasable(handovers: readonly OrderHandover[]) {
  return isHandoverConfirmed(findHandover(handovers, "RETURN"));
}
