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
    const text = String(value).trim();
    const local = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
    if (local) {
        const date = new Date(Number(local[1]), Number(local[2]) - 1, Number(local[3]), Number(local[4] ?? 0), Number(local[5] ?? 0), Number(local[6] ?? 0));
        return Number.isNaN(date.getTime()) ? null : date;
    }
    const date = new Date(text);
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

/** Hiện ngày theo ngày/tháng/năm, không phụ thuộc định dạng vùng của máy. */
export function formatInputDate(value) {
    const date = parseDate(value);
    if (!date)
        return "";
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** Hiện ngày giờ theo dd/mm/yyyy hh:mm. */
export function formatInputDateTime(value) {
    const date = parseDate(value);
    if (!date)
        return "";
    return `${formatInputDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function calendarDate(day, month, year) {
    if (year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1)
        return null;
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day)
        return null;
    return date;
}

/** Đọc ô nhập ngày/tháng/năm thành YYYY-MM-DD. Chuỗi chưa đủ hoặc không hợp lệ trả về rỗng. */
export function parseInputDate(value) {
    const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match)
        return "";
    const date = calendarDate(Number(match[1]), Number(match[2]), Number(match[3]));
    if (!date)
        return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Đọc ô nhập dd/mm/yyyy hh:mm thành YYYY-MM-DDTHH:mm. */
export function parseInputDateTime(value) {
    const match = String(value).trim().match(/^(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2})$/);
    if (!match)
        return "";
    const date = calendarDate(Number(match[1]), Number(match[2]), Number(match[3]));
    const hour = Number(match[4]);
    const minute = Number(match[5]);
    if (!date || hour > 23 || minute > 59)
        return "";
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(hour)}:${pad(minute)}`;
}

export function hoursBetween(start, end) {
    const a = parseDate(start);
    const b = parseDate(end);
    if (!a || !b)
        return 0;
    return Math.max(0, (b.getTime() - a.getTime()) / 3_600_000);
}
