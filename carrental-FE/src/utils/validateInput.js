import { z } from "zod";
import { parseVndInput } from "@/utils/inputParser.js";

export const requiredText = (message) => z.string().trim().min(1, message);
export const emailInput = z.string().trim().regex(/^\S+@\S+\.\S+$/, "Vui lòng nhập email hợp lệ.");
export const httpUrlInput = z.string().trim().max(500, "Đường dẫn tối đa 500 ký tự.")
    .regex(/^https?:\/\/\S+$/i, "Đường dẫn phải bắt đầu bằng http:// hoặc https://.");
export const optionalHttpUrlInput = z.union([z.string().trim().length(0), httpUrlInput]);

function parseStrictVnd(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    if (/^-\d/.test(raw)) return -1;
    const parsed = parseVndInput(raw);
    return parsed === null ? Number.NaN : parsed;
}

function formatNumber(n) {
    return new Intl.NumberFormat("vi-VN").format(n);
}

export function vndInput({ positive = false, min, max = 500_000_000, label = "Giá trị" } = {}) {
    const floor = min ?? (positive ? 1 : 0);
    return z.preprocess(
        parseStrictVnd,
        z.number({ error: `Vui lòng nhập ${label.toLowerCase()} hợp lệ.` })
            .int(`${label} phải là số nguyên VND.`)
            .refine(v => v >= 0, `${label} không được là số âm.`)
            .refine(v => v >= floor, floor === 1 ? `${label} phải lớn hơn 0.` : `${label} tối thiểu là ${formatNumber(floor)}đ.`)
            .refine(v => v <= max, `${label} tối đa là ${formatNumber(max)}đ.`)
    );
}

export function optionalVndInput({ max = 500_000_000, label = "Giá trị" } = {}) {
    return z.preprocess(
        parseStrictVnd,
        z.number({ error: `Vui lòng nhập ${label.toLowerCase()} hợp lệ.` })
            .int(`${label} phải là số nguyên VND.`)
            .refine(v => v >= 0, `${label} không được là số âm.`)
            .refine(v => v <= max, `${label} tối đa là ${formatNumber(max)}đ.`)
            .optional()
    );
}

function parseStrictInteger(value) {
    const raw = String(value ?? "").trim();
    if (!raw) return undefined;
    if (!/^-?\d+$/.test(raw)) return Number.NaN;
    return Number(raw);
}

export function integerInput(min, max, label = "Giá trị") {
    return z.preprocess(
        parseStrictInteger,
        z.number({ error: `Vui lòng nhập ${label.toLowerCase()}.` })
            .int(`${label} phải là số nguyên.`)
            .refine(v => v >= 0 || min < 0, `${label} không được là số âm.`)
            .refine(v => v >= min, `${label} tối thiểu là ${min}.`)
            .refine(v => v <= max, `${label} tối đa là ${max}.`)
    );
}

export function optionalIntegerInput(min, max, label = "Giá trị") {
    return z.preprocess(
        parseStrictInteger,
        z.number({ error: `Vui lòng nhập ${label.toLowerCase()} hợp lệ.` })
            .int(`${label} phải là số nguyên.`)
            .refine(v => v >= 0 || min < 0, `${label} không được là số âm.`)
            .refine(v => v >= min, `${label} tối thiểu là ${min}.`)
            .refine(v => v <= max, `${label} tối đa là ${max}.`)
            .optional()
    );
}

export function validateInput(schema, input) {
    return schema.safeParse(input);
}
