import { parseDate } from "@/utils/datetime.js";

export const DEFAULT_COMMISSION_RATE = 10;
function assertVnd(amount, field) {
    if (!Number.isSafeInteger(amount) || amount < 0)
        throw new RangeError(`${field} phải là số VND nguyên không âm, nhận ${amount}`);
}
/** Tỷ lệ phần trăm NUMERIC(5,2) đổi sang basis point nguyên để tránh sai số dấu phẩy động. */
function toBasisPoints(commissionRate) {
    const basisPoints = Math.round(commissionRate * 100);
    if (basisPoints < 0 || basisPoints > 10000)
        throw new RangeError(`commissionRate phải nằm trong 0–100, nhận ${commissionRate}`);
    return basisPoints;
}
export function calculateRentalAmount(unitPrice, quantity) {
    assertVnd(unitPrice, "unitPrice");
    if (!Number.isInteger(quantity) || quantity <= 0)
        throw new RangeError(`quantity phải là số nguyên dương, nhận ${quantity}`);
    const rentalAmount = unitPrice * quantity;
    assertVnd(rentalAmount, "rentalAmount");
    return rentalAmount;
}
/** Số tiền người thuê trả. Voucher không bao giờ làm tổng âm. */
export function calculateTotalAmount(rentalAmount, discountAmount) {
    assertVnd(rentalAmount, "rentalAmount");
    assertVnd(discountAmount, "discountAmount");
    return Math.max(0, rentalAmount - discountAmount);
}
/** Phí nền tảng làm tròn nửa lên đến đồng, khớp với ROUND của PostgreSQL cho số dương. */
export function calculatePlatformFee(grossAmount, commissionRate = DEFAULT_COMMISSION_RATE) {
    assertVnd(grossAmount, "grossAmount");
    const product = grossAmount * toBasisPoints(commissionRate);
    assertVnd(product, "grossAmount * commissionRate");
    return Math.round(product / 10000);
}
/**
 * Payout chủ xe tính trên `rentalAmount`, không phải `totalAmount`:
 * voucher do CarDB tài trợ và tiền cọc do chủ xe tự thu nên đều không ảnh hưởng.
 */
export function calculatePayout(order) {
    const grossAmount = order.rentalAmount;
    const platformFee = calculatePlatformFee(grossAmount, order.commissionRate);
    return { grossAmount, platformFee, netAmount: grossAmount - platformFee };
}
export function sumAmounts(rows, pick) {
    return rows.reduce((total, row) => total + pick(row), 0);
}
const vndFormatter = new Intl.NumberFormat("vi-VN");
export const formatVnd = (amount) => `${vndFormatter.format(amount)} đ`;
/** Rút gọn VND thành triệu, ví dụ 16.950.000 → "16,95 Tr VND". */
export function formatTrVnd(amount) {
    const abs = Math.abs(Math.trunc(amount));
    const thousandths = Math.round(abs / 1000);
    const whole = Math.floor(thousandths / 1000);
    const fraction = String(thousandths % 1000).padStart(3, "0").replace(/0+$/, "");
    const body = fraction ? `${vndFormatter.format(whole)},${fraction}` : vndFormatter.format(whole);
    return `${amount < 0 ? "-" : ""}${body} Tr VND`;
}
export const formatPercent = (rate) => `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(rate)}%`;

const dateTime = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeShort = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
export function formatRentalPeriod(order) {
    const start = dateTime.format(parseDate(order.startTime));
    const end = dateTime.format(parseDate(order.endTime));
    const unit = order.rentalType === "DAILY" ? "ngày" : "giờ";
    return { range: `${start} — ${end}`, duration: `Tổng thời gian: ${order.quantity} ${unit}` };
}
export function formatActivityTime(iso) {
    return dateTimeShort.format(parseDate(iso));
}
export function maskBankAccount(accountNumber) {
    const digits = accountNumber.replace(/\D/g, "");
    return digits.length >= 4 ? `••••${digits.slice(-3)}` : accountNumber;
}
const carTypeLabels = {
    SEDAN: "Sedan",
    HATCHBACK: "Hatchback",
    SUV: "SUV",
    MPV: "MPV",
    PICKUP: "Pickup",
    LUXURY: "Hạng sang",
    OTHER: "Khác",
};
const fuelLabels = {
    GASOLINE: "xăng",
    DIESEL: "dầu",
    ELECTRIC: "thuần điện",
    HYBRID: "hybrid",
};
export function carSubtitle(car) {
    if (car.fuelType === "ELECTRIC")
        return `${carTypeLabels[car.carType]} ${car.seats} chỗ thuần điện AWD`;
    if (car.carType === "LUXURY")
        return `${carTypeLabels[car.carType]} ${car.seats} chỗ sang trọng`;
    if (car.status === "PENDING_APPROVAL")
        return `${carTypeLabels[car.carType]} ${car.seats} chỗ sang trọng • Đang thẩm định`;
    return `${carTypeLabels[car.carType]} ${car.seats} chỗ • ${fuelLabels[car.fuelType]}`;
}
export function isApprovedCar(status) {
    return status === "ACTIVE" || status === "INACTIVE";
}

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

export const toneClasses = {
    neutral: "bg-badge-gray text-charcoal border-border-light",
    info: "bg-status-blue-bg text-blue-800 border-blue-200",
    success: "bg-status-green-bg text-status-success-ink border-emerald-border",
    warning: "bg-status-amber-bg text-amber-800 border-amber-200",
    danger: "bg-error-container text-on-error-container border-red-200",
    brand: "bg-accent-soft text-on-primary-fixed-variant border-primary-fixed",
};
export const kycStatusMeta = {
    NONE: { label: "Chưa xác minh", tone: "neutral" },
    PENDING: { label: "Đang xét duyệt", tone: "warning" },
    VERIFIED: { label: "Đã xác minh", tone: "success" },
    REJECTED: { label: "Bị từ chối", tone: "danger" },
    UNKNOWN: { label: "KYC do CarDB kiểm tra", tone: "neutral" },
};
export const carStatusMeta = {
    PENDING_APPROVAL: { label: "Chờ duyệt", tone: "warning" },
    ACTIVE: { label: "Đang cho thuê", tone: "success" },
    INACTIVE: { label: "Tạm ngưng", tone: "neutral" },
    REJECTED: { label: "Bị từ chối", tone: "danger" },
};
export const slotStatusMeta = {
    OPEN: { label: "Đang mở", tone: "success" },
    CLOSED: { label: "Đã đóng", tone: "neutral" },
    CANCELLED: { label: "Đã hủy", tone: "danger" },
};
export const orderStatusMeta = {
    PENDING: { label: "Chờ phản hồi", tone: "warning" },
    CONFIRMED: { label: "Đã xác nhận", tone: "info" },
    REJECTED: { label: "Đã từ chối", tone: "danger" },
    EXPIRED: { label: "Quá hạn", tone: "neutral" },
    ONGOING: { label: "Đang thuê", tone: "brand" },
    COMPLETED: { label: "Hoàn thành", tone: "success" },
    CANCELLED: { label: "Đã hủy", tone: "danger" },
};
export const paymentStatusMeta = {
    UNPAID: { label: "Chưa thanh toán", tone: "warning" },
    PAID: { label: "Đã thanh toán", tone: "success" },
    REFUNDED: { label: "Đã hoàn tiền", tone: "neutral" },
};
export const payoutStatusMeta = {
    PENDING: { label: "Đang giữ escrow", tone: "warning" },
    PROCESSING: { label: "Đang chuyển", tone: "info" },
    PAID: { label: "Đã chuyển khoản", tone: "success" },
    FAILED: { label: "Chuyển thất bại", tone: "danger" },
};
export const handoverTypeMeta = {
    PICKUP: { code: "C10-A", label: "Biên bản nhận xe", tone: "info" },
    RETURN: { code: "C10-B", label: "Biên bản trả xe", tone: "brand" },
};
