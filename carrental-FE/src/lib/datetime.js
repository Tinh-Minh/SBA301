const pad = (value) => String(value).padStart(2, "0");

/** Chuyển giá trị ngày giờ từ backend (chuỗi ISO hoặc mảng [y,m,d,h,mi,s]) thành Date. */
export function parseDate(value) {
    if (value === null || value === undefined || value === "")
        return null;
    if (value instanceof Date)
        return value;
    if (Array.isArray(value)) {
        const [y, m = 1, d = 1, h = 0, mi = 0, s = 0] = value;
        return new Date(y, m - 1, d, h, mi, s);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

/** Chuỗi ISO giờ địa phương không kèm múi giờ — định dạng LocalDateTime backend yêu cầu. */
export function toLocalIso(value) {
    const date = parseDate(value);
    if (!date)
        return null;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** Ngày dạng YYYY-MM-DD (LocalDate). */
export function toLocalDate(value) {
    const date = parseDate(value);
    if (!date)
        return null;
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Đọc ngày giờ từ query: ISO, datetime-local, hoặc "HH:mm, dd/MM/yyyy" của ô tìm trên trang chủ. */
export function parseQueryDateTime(value) {
    if (!value)
        return "";
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(value))
        return value.slice(0, 16);
    const match = String(value).match(/(\d{1,2}):(\d{2}).*?(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match)
        return "";
    return `${match[5]}-${pad(match[4])}-${pad(match[3])}T${pad(match[1])}:${match[2]}`;
}

/** Giá trị cho input `datetime-local`. */
export function toInputDateTime(value) {
    const date = parseDate(value);
    if (!date)
        return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDateTime(value, fallback = "—") {
    const date = parseDate(value);
    if (!date)
        return fallback;
    return `${pad(date.getHours())}:${pad(date.getMinutes())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function formatDate(value, fallback = "—") {
    const date = parseDate(value);
    if (!date)
        return fallback;
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

export function hoursBetween(start, end) {
    const a = parseDate(start);
    const b = parseDate(end);
    if (!a || !b)
        return 0;
    return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}

export function addHours(value, hours) {
    const date = parseDate(value) ?? new Date();
    return new Date(date.getTime() + hours * 3_600_000);
}
