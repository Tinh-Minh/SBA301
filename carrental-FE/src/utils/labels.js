const vnd = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export function toNumber(value) {
    if (value === null || value === undefined || value === "")
        return 0;
    const number = typeof value === "number" ? value : Number(value);
    return Number.isFinite(number) ? number : 0;
}

export const formatMoney = (value) => `${vnd.format(Math.round(toNumber(value)))} đ`;

export const carTypeLabels = {
    SEDAN: "Sedan",
    HATCHBACK: "Hatchback",
    SUV: "SUV",
    MPV: "MPV",
    PICKUP: "Bán tải",
    LUXURY: "Hạng sang",
    OTHER: "Khác",
};
export const fuelTypeLabels = { GASOLINE: "Xăng", DIESEL: "Dầu", ELECTRIC: "Điện", HYBRID: "Hybrid" };
export const transmissionLabels = { AUTOMATIC: "Số tự động", MANUAL: "Số sàn" };
export const rentalTypeLabels = { HOURLY: "Theo giờ", DAILY: "Theo ngày", BOTH: "Giờ & ngày" };
export const orderStatusLabels = {
    PENDING: "Chờ chủ xe xác nhận",
    CONFIRMED: "Đã xác nhận",
    REJECTED: "Bị từ chối",
    EXPIRED: "Hết hạn",
    ONGOING: "Đang thuê",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
};
export const orderStatusTone = {
    PENDING: "bg-[#FEF3C7] text-[#B45309]",
    CONFIRMED: "bg-[#DBEAFE] text-[#1D4ED8]",
    REJECTED: "bg-[#FEE2E2] text-[#B91C1C]",
    EXPIRED: "bg-[#F0F1EF] text-[#666666]",
    ONGOING: "bg-[#CCFBF1] text-[#0F766E]",
    COMPLETED: "bg-[#D1FAE5] text-[#047857]",
    CANCELLED: "bg-[#FEE2E2] text-[#B91C1C]",
};
export const paymentStatusLabels = { UNPAID: "Chưa thanh toán", PAID: "Đã thanh toán", REFUNDED: "Đã hoàn tiền" };
export const transactionStatusLabels = { PENDING: "Đang chờ", SUCCESS: "Thành công", FAILED: "Thất bại", CANCELLED: "Đã hủy" };
export const transactionTypeLabels = {
    DEPOSIT: "Tiền cọc",
    RENTAL_PAYMENT: "Tiền thuê",
    EXTRA_FEE: "Phụ phí",
    REFUND: "Hoàn tiền",
};
export const paymentMethodLabels = { VNPAY: "VNPay", MOMO: "MoMo", BANK_TRANSFER: "Chuyển khoản", CASH: "Tiền mặt" };
export const kycStatusLabels = { NONE: "Chưa xác minh", PENDING: "Đang xét duyệt", VERIFIED: "Đã xác minh", REJECTED: "Bị từ chối" };
export const verifyStatusLabels = { PENDING: "Chờ duyệt", APPROVED: "Đã duyệt", REJECTED: "Bị từ chối" };
export const docTypeLabels = { CITIZEN_ID: "CCCD / CMND", DRIVER_LICENSE: "Giấy phép lái xe", PASSPORT: "Hộ chiếu" };
export const disputeStatusLabels = { OPEN: "Mới mở", IN_REVIEW: "Đang xem xét", RESOLVED: "Đã giải quyết", REJECTED: "Bác bỏ" };
export const handoverTypeLabels = { PICKUP: "Nhận xe", RETURN: "Trả xe" };
export const feeTypeLabels = {
    LATE_RETURN: "Trả xe trễ",
    FUEL: "Nhiên liệu / Pin",
    CLEANING: "Vệ sinh xe",
    DAMAGE: "Hư hại / Trầy xước",
    TRAFFIC_FINE: "Phạt nguội",
    EXTRA_KM: "Quá số km",
    OTHER: "Phí khác",
};
export const extraFeeStatusLabels = {
    PENDING: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    WAIVED: "Đã miễn trừ",
    CANCELLED: "Đã hủy",
};
export const extraFeeStatusTone = {
    PENDING: "bg-[#FEF3C7] text-[#B45309]",
    PAID: "bg-[#D1FAE5] text-[#047857]",
    WAIVED: "bg-[#F3F4F6] text-[#374151]",
    CANCELLED: "bg-[#FEE2E2] text-[#B91C1C]",
};

export function carName(item) {
    if (!item)
        return "Xe";
    if (item.carName)
        return item.carName;
    return [item.brand, item.model].filter(Boolean).join(" ") || "Xe";
}

export function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length)
        return "?";
    return parts.length === 1 ? parts[0][0].toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const FALLBACK_CAR_IMAGE = "/images/cardb-02d5cb41aa8f9514.webp";

export function carImage(item) {
    if (!item)
        return FALLBACK_CAR_IMAGE;
    if (item.primaryImageUrl)
        return item.primaryImageUrl;
    const images = Array.isArray(item.images) ? item.images : [];
    const primary = images.find(image => image.isPrimary || image.primary) ?? images[0];
    return primary?.imageUrl || FALLBACK_CAR_IMAGE;
}
