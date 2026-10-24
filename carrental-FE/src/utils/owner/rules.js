export const OWNER_RESPONSE_WINDOW_MS = 2 * 60 * 60 * 1000;
export function isOrderExpired(order, now = Date.now()) {
    return order.status === "PENDING" && !!order.expiresAt && Date.parse(order.expiresAt) <= now;
}
export function canRespondToOrder(order, now = Date.now()) {
    return order.status === "PENDING" && !isOrderExpired(order, now);
}
export function isHandoverConfirmed(handover) {
    return !!handover?.ownerConfirmedAt && !!handover.renterConfirmedAt;
}
export function findHandover(handovers, type) {
    return handovers.find(handover => handover.handoverType === type);
}
/** C10-A phải được cả hai bên xác nhận trước khi lập C10-B. */
export function nextHandoverType(handovers) {
    const pickup = findHandover(handovers, "PICKUP");
    if (!isHandoverConfirmed(pickup))
        return "PICKUP";
    return isHandoverConfirmed(findHandover(handovers, "RETURN")) ? null : "RETURN";
}
/** Payout chuyển từ PENDING sang PAID chỉ khi C10-B được cả chủ xe và người thuê xác nhận. */
export function isPayoutReleasable(handovers) {
    return isHandoverConfirmed(findHandover(handovers, "RETURN"));
}
