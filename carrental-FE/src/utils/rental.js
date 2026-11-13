import { formatDateTime, parseDate, toInputDateTime, toLocalIso } from "@/utils/datetime.js";

export const MIN_RENTAL_HOURS = 4;
export const MAX_RENTAL_DAYS = 30;

/** Mặc định: nhận xe 9h sáng mai, trả 9h sáng ngày kia (giá trị cho input datetime-local). */
export function defaultWindow() {
    const pickup = new Date();
    pickup.setDate(pickup.getDate() + 1);
    pickup.setHours(9, 0, 0, 0);
    const ret = new Date(pickup);
    ret.setDate(ret.getDate() + 1);
    return { pickupAt: toInputDateTime(pickup), returnAt: toInputDateTime(ret) };
}

/** Kiểm tra khoảng thuê giống backend; trả về thông báo lỗi hoặc null. */
export function windowError(pickupAt, returnAt) {
    const pickup = parseDate(pickupAt);
    const ret = parseDate(returnAt);
    if (!pickup || !ret) return "Vui lòng chọn thời gian nhận xe và trả xe.";
    if (pickup.getTime() < Date.now() + 59 * 60 * 1000) return "Giờ nhận xe phải sau hiện tại ít nhất 1 giờ.";
    if (ret <= pickup) return "Giờ trả xe phải sau giờ nhận xe.";
    const hours = (ret - pickup) / 3_600_000;
    if (hours < MIN_RENTAL_HOURS) return `Thời gian thuê tối thiểu ${MIN_RENTAL_HOURS} giờ.`;
    if (hours > MAX_RENTAL_DAYS * 24) return `Thời gian thuê tối đa ${MAX_RENTAL_DAYS} ngày.`;
    return null;
}

/** Quy thời gian thuê về ngày (khối 24 giờ) + giờ lẻ (làm tròn lên). */
export function splitDuration(pickupAt, returnAt) {
    const pickup = parseDate(pickupAt);
    const ret = parseDate(returnAt);
    if (!pickup || !ret || ret <= pickup) return { days: 0, hours: 0, totalHours: 0 };
    const totalHours = Math.ceil((ret - pickup) / 3_600_000);
    return { days: Math.floor(totalHours / 24), hours: totalHours % 24, totalHours };
}

export function durationLabel(days, hours) {
    const parts = [];
    if (days) parts.push(`${days} ngày`);
    if (hours) parts.push(`${hours} giờ`);
    return parts.join(" ") || "0 giờ";
}

/** Ước tính nhanh (không tính giá cuối tuần) để hiển thị trên thẻ xe; giá chốt lấy từ API báo giá. */
export function estimate(pricePerDay, pickupAt, returnAt) {
    const { days, hours } = splitDuration(pickupAt, returnAt);
    const day = Number(pricePerDay || 0);
    const hourly = Math.ceil(day / 10 / 1000) * 1000;
    return days * day + Math.min(hours * hourly, hours ? day : 0);
}

export const toApiTime = (value) => toLocalIso(value);
export const showTime = (value) => formatDateTime(value);

export const bookingStatusMeta = {
    REQUESTED: { label: "Chờ chủ xe xác nhận", tone: "warning" },
    CONFIRMED: { label: "Đã xác nhận", tone: "info" },
    REJECTED: { label: "Bị từ chối", tone: "danger" },
    CANCELLED: { label: "Đã huỷ", tone: "neutral" },
    EXPIRED: { label: "Quá hạn phản hồi", tone: "neutral" },
    PICKUP_PENDING: { label: "Chờ xác nhận nhận xe", tone: "warning" },
    IN_PROGRESS: { label: "Đang thuê", tone: "success" },
    RETURN_PENDING: { label: "Chờ xác nhận trả xe", tone: "warning" },
    COMPLETED: { label: "Hoàn tất", tone: "success" },
};

export const handoverCategories = [
    { id: "EXTERIOR_FRONT", label: "Ngoại thất phía trước", required: true },
    { id: "EXTERIOR_REAR", label: "Ngoại thất phía sau", required: true },
    { id: "EXTERIOR_LEFT", label: "Thân xe bên trái", required: true },
    { id: "EXTERIOR_RIGHT", label: "Thân xe bên phải", required: true },
    { id: "INTERIOR", label: "Nội thất, ghế, taplo", required: true },
    { id: "DASHBOARD_ODOMETER", label: "Đồng hồ: số km, nhiên liệu/pin", required: true },
    { id: "DOCUMENTS", label: "Giấy tờ xe (đăng ký, đăng kiểm, bảo hiểm)", required: true },
    { id: "TIRES", label: "Lốp xe, mâm", required: false },
    { id: "ACCESSORIES", label: "Phụ kiện (chìa khoá, sạc...)", required: false },
    { id: "DAMAGE", label: "Vết trầy xước / hư hỏng có sẵn", required: false },
];

export const safetyLevelMeta = {
    SAFE: { label: "An toàn", tone: "success", icon: "verified" },
    ATTENTION: { label: "Cần lưu ý", tone: "warning", icon: "info" },
    UNSAFE: { label: "Không đạt / hết hạn", tone: "danger", icon: "warning" },
    UNKNOWN: { label: "Chưa đủ thông tin", tone: "neutral", icon: "info" },
};
