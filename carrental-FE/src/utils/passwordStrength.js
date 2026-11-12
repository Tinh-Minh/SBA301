import { ZxcvbnFactory } from "@zxcvbn-ts/core";
import { adjacencyGraphs, dictionary as commonDictionary } from "@zxcvbn-ts/language-common";
import { dictionary as englishDictionary, translations as englishTranslations } from "@zxcvbn-ts/language-en";

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MEDIUM_LENGTH = 12;
export const PASSWORD_MAX_UTF8_BYTES = 72;

export const PASSWORD_MESSAGES = {
    minLength: "Mật khẩu cần tối thiểu 8 ký tự",
    personal: "Mật khẩu chứa thông tin cá nhân",
    guessable: "Mật khẩu quá dễ đoán",
    tooLong: "Mật khẩu quá dài.",
};

const APP_BLOCKLIST = ["cardb", "car", "rental", "admin", "123456"];
const LABELS = ["Rất yếu", "Yếu", "Trung bình", "Khá", "Rất mạnh"];

const translations = {
    ...englishTranslations,
    warnings: {
        ...englishTranslations.warnings,
        straightRow: "Hàng phím thẳng trên bàn phím rất dễ đoán.",
        keyPattern: "Mẫu phím ngắn rất dễ đoán.",
        simpleRepeat: "Ký tự lặp như \"aaa\" rất dễ đoán.",
        extendedRepeat: "Cụm ký tự lặp lại rất dễ đoán.",
        sequences: "Chuỗi ký tự liên tiếp rất dễ đoán.",
        recentYears: "Các năm gần đây rất dễ đoán.",
        dates: "Ngày tháng rất dễ đoán.",
        topTen: "Đây là mật khẩu bị dùng quá nhiều.",
        topHundred: "Đây là mật khẩu rất phổ biến.",
        common: "Đây là mật khẩu thường gặp trong các vụ rò rỉ.",
        similarToCommon: "Mật khẩu này gần giống một mật khẩu đã bị lộ.",
        wordByItself: "Một từ đơn lẻ rất dễ đoán.",
        namesByThemselves: "Họ hoặc tên đứng một mình rất dễ đoán.",
        commonNames: "Họ và tên phổ biến rất dễ đoán.",
        userInputs: "Mật khẩu không nên chứa thông tin cá nhân.",
        pwned: "Mật khẩu này đã xuất hiện trong các vụ rò rỉ dữ liệu.",
    },
    suggestions: {
        ...englishTranslations.suggestions,
        l33t: "Tránh thay chữ bằng ký tự dễ đoán, ví dụ P@ssw0rd.",
        reverseWords: "Tránh viết ngược các từ phổ biến.",
        allUppercase: "Không nên viết hoa toàn bộ mật khẩu.",
        capitalization: "Viết hoa thêm, không chỉ chữ cái đầu.",
        dates: "Tránh ngày và năm gắn với bạn.",
        recentYears: "Tránh các năm gần đây.",
        associatedYears: "Tránh năm gắn với thông tin của bạn.",
        sequences: "Tránh chuỗi ký tự liên tiếp.",
        repeated: "Tránh từ hoặc ký tự lặp lại.",
        longerKeyboardPattern: "Tránh các mẫu gõ liền trên bàn phím như qwerty.",
        anotherWord: "Nên thêm từ ngẫu nhiên để mật khẩu dài hơn.",
        useWords: "Hãy dùng một cụm nhiều từ, tránh câu phổ biến.",
        noNeed: "Mật khẩu dài không cần bắt buộc ký tự đặc biệt, số hay chữ hoa.",
        pwned: "Nếu bạn dùng mật khẩu này ở nơi khác, hãy đổi nó.",
    },
};

let checker;

function getChecker() {
    if (!checker) {
        checker = new ZxcvbnFactory({
            translations,
            graphs: adjacencyGraphs,
            dictionary: {
                ...commonDictionary,
                ...englishDictionary,
            },
        });
    }
    return checker;
}

function fold(value) {
    return String(value ?? "")
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/đ/g, "d")
        .toLowerCase();
}

function compact(value) {
    return fold(value).replace(/[^a-z0-9]/g, "");
}

function addToken(target, token, minimum) {
    const cleaned = compact(token);
    if (cleaned.length >= minimum) target.add(cleaned);
}

/** Từ khóa cá nhân và từ khóa ứng dụng dùng để hạ điểm mật khẩu. */
export function passwordContext({ fullName = "", email = "", phone = "" } = {}) {
    const personal = new Set();
    const name = fold(fullName);
    for (const part of name.split(/[^a-z0-9]+/)) addToken(personal, part, 4);
    addToken(personal, name, 4);

    const local = String(email).split("@")[0] ?? "";
    addToken(personal, local, 3);
    for (const part of fold(local).split(/[^a-z0-9]+/)) addToken(personal, part, 4);

    const digits = String(phone).replace(/\D/g, "");
    if (digits.length >= 4) {
        personal.add(digits);
        personal.add(digits.slice(-4));
        if (digits.length >= 5) personal.add(digits.slice(-5));
        if (digits.length >= 6) personal.add(digits.slice(-6));
    }

    return { personal: [...personal], blocked: [...APP_BLOCKLIST] };
}

function findToken(password, tokens) {
    const folded = fold(password);
    const collapsed = compact(password);
    return tokens.find(token => folded.includes(token) || collapsed.includes(token)) ?? "";
}

function emptyStrength() {
    return {
        password: "",
        length: 0,
        score: 0,
        rawScore: 0,
        acceptable: false,
        tooShort: true,
        tooLong: false,
        personal: false,
        blocked: false,
        matched: "",
        label: "",
        warning: "",
        suggestions: [],
        message: PASSWORD_MESSAGES.minLength,
    };
}

/**
 * Chấm mật khẩu theo zxcvbn. Tên, email và số điện thoại được đưa vào như dữ liệu
 * gợi ý để mật khẩu kiểu "tên + năm" vẫn yếu, nhưng không ép điểm về 0 chỉ vì có trùng một mảnh tên.
 * @param {{ password?: string, fullName?: string, email?: string, phone?: string }} values
 */
export function evaluatePasswordStrength({ password = "", fullName = "", email = "", phone = "" } = {}) {
    const value = String(password ?? "");
    if (!value) return emptyStrength();

    const length = [...value].length;
    const tooShort = length < PASSWORD_MIN_LENGTH;
    const tooLong = new TextEncoder().encode(value).length > PASSWORD_MAX_UTF8_BYTES;
    const context = passwordContext({ fullName, email, phone });
    const blockedMatch = findToken(value, context.blocked);
    const result = getChecker().check(value, [...context.personal, ...context.blocked]);
    const rawScore = result.score;
    const hasSymbol = /[^\p{L}\p{N}\s]/u.test(value);
    const score = blockedMatch ? 0 : (!hasSymbol && rawScore > 3 ? 3 : rawScore);
    const acceptable = !tooShort && !tooLong && !blockedMatch && (score >= 3 || (score === 2 && length >= PASSWORD_MEDIUM_LENGTH));
    const suggestions = [];
    if (blockedMatch) suggestions.push("Tránh dùng từ dễ đoán như cardb, car, rental, admin, 123456.");
    for (const suggestion of result.feedback?.suggestions ?? []) suggestions.push(suggestion);
    if (!tooLong && score < 3 && length < PASSWORD_MEDIUM_LENGTH) suggestions.push("Nên thêm từ ngẫu nhiên để mật khẩu dài hơn.");

    let message = "";
    if (tooShort) message = PASSWORD_MESSAGES.minLength;
    else if (tooLong) message = PASSWORD_MESSAGES.tooLong;
    else if (blockedMatch || !acceptable) message = PASSWORD_MESSAGES.guessable;

    return {
        password: value,
        length,
        score,
        rawScore,
        acceptable,
        tooShort,
        tooLong,
        personal: false,
        blocked: Boolean(blockedMatch),
        matched: blockedMatch,
        label: blockedMatch ? "Yếu" : LABELS[score],
        warning: blockedMatch || tooShort || tooLong ? message : (result.feedback?.warning ?? ""),
        suggestions: [...new Set(suggestions)].slice(0, 3),
        message,
    };
}
