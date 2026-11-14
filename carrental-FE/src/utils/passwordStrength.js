export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_UTF8_BYTES = 72;

export const PASSWORD_MESSAGES = {
    minLength: "Mật khẩu cần tối thiểu 8 ký tự",
    weak: "Mật khẩu yếu: cần ít nhất 2 trong 3 yếu tố (chữ hoa, chữ số, ký tự đặc biệt)",
    blocked: "Mật khẩu chứa từ quá dễ đoán",
    tooLong: "Mật khẩu quá dài.",
};

const APP_BLOCKLIST = ["cardb", "123456", "password", "matkhau"];

/** Các yếu tố được chấm. Thứ tự này cũng là thứ tự hiển thị trong danh sách kiểm tra. */
export const PASSWORD_RULES = [
    { id: "length", label: "Tối thiểu 8 ký tự", test: v => [...v].length >= PASSWORD_MIN_LENGTH },
    { id: "upper", label: "Ít nhất 1 chữ cái viết hoa", test: v => /\p{Lu}/u.test(v) },
    { id: "digit", label: "Ít nhất 1 chữ số", test: v => /\p{N}/u.test(v) },
    { id: "special", label: "Ít nhất 1 ký tự đặc biệt (!@#$%…)", test: v => /[^\p{L}\p{N}\s]/u.test(v) },
];

/** 1 = Yếu, 2 = Khá, 3 = Mạnh. */
export const STRENGTH_LABELS = { 1: "Yếu", 2: "Khá", 3: "Mạnh" };

function emptyStrength() {
    return {
        password: "", length: 0, score: 0, factors: 0, checks: Object.fromEntries(PASSWORD_RULES.map(r => [r.id, false])),
        acceptable: false, tooShort: true, tooLong: false, blocked: false, label: "", warning: "", suggestions: [],
        message: PASSWORD_MESSAGES.minLength,
    };
}

/**
 * Chấm độ mạnh mật khẩu theo 3 yếu tố: chữ hoa, chữ số, ký tự đặc biệt (cộng điều kiện đủ 8 ký tự).
 * - Chưa đủ 8 ký tự, hoặc có 0–1 yếu tố (chỉ toàn chữ, chỉ toàn số…) → Yếu
 * - Đủ 8 ký tự và có 2 yếu tố → Khá
 * - Đủ 8 ký tự và có đủ 3 yếu tố → Mạnh
 * Được phép đăng ký khi đạt Khá trở lên.
 */
export function evaluatePasswordStrength({ password = "" } = {}) {
    const value = String(password ?? "");
    if (!value) return emptyStrength();

    const checks = Object.fromEntries(PASSWORD_RULES.map(r => [r.id, r.test(value)]));
    const factors = Number(checks.upper) + Number(checks.digit) + Number(checks.special);
    const length = [...value].length;
    const tooShort = !checks.length;
    const tooLong = new TextEncoder().encode(value).length > PASSWORD_MAX_UTF8_BYTES;
    const lower = value.toLowerCase();
    const blocked = APP_BLOCKLIST.some(word => lower.includes(word));

    const score = tooShort || blocked || factors <= 1 ? 1 : factors === 2 ? 2 : 3;
    const acceptable = !tooLong && score >= 2;

    let message = "";
    if (tooShort) message = PASSWORD_MESSAGES.minLength;
    else if (tooLong) message = PASSWORD_MESSAGES.tooLong;
    else if (blocked) message = PASSWORD_MESSAGES.blocked;
    else if (!acceptable) message = PASSWORD_MESSAGES.weak;

    return {
        password: value, length, score, factors, checks, acceptable, tooShort, tooLong, blocked,
        label: STRENGTH_LABELS[score],
        warning: blocked ? PASSWORD_MESSAGES.blocked : tooLong ? PASSWORD_MESSAGES.tooLong : "",
        suggestions: [],
        message,
    };
}
