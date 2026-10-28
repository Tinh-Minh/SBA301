export function digitsOnly(value) {
    return String(value ?? "").replace(/\D/g, "");
}

export function formatVndInput(value) {
    const digits = digitsOnly(value);
    return digits ? new Intl.NumberFormat("vi-VN").format(Number(digits)) : "";
}

// Empty input stays empty; validation decides whether the field is required.
export function parseVndInput(value) {
    const text = String(value ?? "").trim();
    if (!text || !/^\d+(?:[.,\s]\d+)*$/.test(text)) return null;
    const amount = Number(digitsOnly(text));
    return Number.isSafeInteger(amount) && amount >= 0 ? amount : null;
}
