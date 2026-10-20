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
export const formatPercent = (rate) => `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 2 }).format(rate)}%`;
