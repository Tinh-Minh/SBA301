import { parseDate } from "@/shared/utils/datetime.js";
import { toNumber } from "@/shared/utils/labels.js";

const isoOrNull = (value) => parseDate(value)?.toISOString() ?? null;
const money = (value) => Math.round(toNumber(value));

/** Chuẩn hóa CarResponse / CarSummaryResponse: tiền thành số nguyên, có `primaryImageUrl`. */
export function normalizeCar(car) {
    if (!car)
        return car;
    const images = Array.isArray(car.images) ? car.images.slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)) : [];
    const primary = images.find(image => image.isPrimary) ?? images[0];
    return {
        ...car,
        images,
        documents: Array.isArray(car.documents) ? car.documents : [],
        primaryImageUrl: car.primaryImageUrl ?? primary?.imageUrl ?? null,
        pricePerHour: money(car.pricePerHour),
        pricePerDay: money(car.pricePerDay),
        depositAmount: money(car.depositAmount),
        extraKmFee: money(car.extraKmFee),
        kmLimitPerDay: car.kmLimitPerDay ?? null,
    };
}

/** Chuẩn hóa OrderResponseDTO: ngày giờ thành ISO đầy đủ, tiền thành số nguyên. */
export function normalizeOrder(order) {
    if (!order)
        return order;
    return {
        ...order,
        startTime: isoOrNull(order.startTime),
        endTime: isoOrNull(order.endTime),
        actualStartTime: isoOrNull(order.actualStartTime),
        actualEndTime: isoOrNull(order.actualEndTime),
        expiresAt: isoOrNull(order.expiresAt),
        confirmedAt: isoOrNull(order.confirmedAt),
        cancelledAt: isoOrNull(order.cancelledAt),
        createdAt: isoOrNull(order.createdAt),
        updatedAt: isoOrNull(order.updatedAt),
        unitPrice: money(order.unitPrice),
        quantity: Math.max(1, Math.round(toNumber(order.quantity))),
        rentalAmount: money(order.rentalAmount),
        discountAmount: money(order.discountAmount),
        totalAmount: money(order.totalAmount),
        depositAmount: money(order.depositAmount),
        commissionRate: toNumber(order.commissionRate ?? 10),
    };
}

export function normalizeHandover(handover) {
    if (!handover)
        return handover;
    return {
        ...handover,
        handedAt: isoOrNull(handover.handedAt),
        renterConfirmedAt: isoOrNull(handover.renterConfirmedAt),
        ownerConfirmedAt: isoOrNull(handover.ownerConfirmedAt),
        createdAt: isoOrNull(handover.createdAt),
        odometerKm: toNumber(handover.odometerKm),
        fuelPercent: toNumber(handover.fuelPercent),
        images: Array.isArray(handover.images) ? handover.images : [],
    };
}

export function normalizeExtraFee(fee) {
    if (!fee)
        return fee;
    return {
        ...fee,
        amount: money(fee.amount),
        createdAt: isoOrNull(fee.createdAt),
    };
}

export function normalizeSlot(slot) {
    if (!slot)
        return slot;
    return {
        ...slot,
        id: slot.id ?? slot.slotId,
        startTime: isoOrNull(slot.startTime ?? slot.slotStartTime),
        endTime: isoOrNull(slot.endTime ?? slot.slotEndTime),
        pricePerHour: money(slot.pricePerHour),
        pricePerDay: money(slot.pricePerDay),
    };
}

export function normalizePayout(payout) {
    if (!payout)
        return payout;
    return {
        ...payout,
        grossAmount: money(payout.grossAmount),
        platformFee: money(payout.platformFee),
        netAmount: money(payout.netAmount),
        paidAt: isoOrNull(payout.paidAt),
        createdAt: isoOrNull(payout.createdAt),
    };
}

/** BankAccountResponse chỉ trả số đã che; giữ tên trường `accountNumber` cho các màn cũ. */
export function normalizeBankAccount(account) {
    if (!account)
        return account;
    return { ...account, accountNumber: account.accountNumberMasked ?? account.accountNumber ?? "" };
}

/** Backend không cho chủ xe xem hồ sơ khách thuê, chỉ có `customerName` trên đơn. */
export function renterFromOrder(order) {
    return { id: order.customerId, fullName: order.customerName || `Khách #${order.customerId}`, phone: "Liên hệ qua CarDB", kycStatus: "UNKNOWN" };
}

/** Khi không tải được chi tiết xe, dựng tối thiểu từ thông tin trên đơn. */
export function carFromOrder(order) {
    const [brand, ...rest] = String(order.carName || "Xe").split(" ");
    return normalizeCar({ id: order.carId, brand, model: rest.join(" "), licensePlate: order.licensePlate, status: "ACTIVE", pickupAddress: "", seats: 0 });
}
