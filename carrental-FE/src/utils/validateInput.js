import { z } from "zod";
import { parseVndInput } from "@/utils/inputParser.js";

export const requiredText = (message) => z.string().trim().min(1, message);
export const emailInput = z.string().trim().regex(/^\S+@\S+\.\S+$/, "Vui lòng nhập email hợp lệ.");
export const httpUrlInput = z.string().trim().max(500, "Đường dẫn tối đa 500 ký tự.")
    .regex(/^(https?:\/\/\S+|\/(?!\/)\S+)$/i, "Đường dẫn phải là URL (http/https) hoặc tệp đã tải lên (/api/uploads/...).");
export const optionalHttpUrlInput = z.union([z.string().trim().length(0), httpUrlInput]);
export const mediaUrlInput = z.string().trim().max(500, "Đường dẫn tối đa 500 ký tự.")
    .regex(/^(\/(?!\/)\S+|blob:\S+)$/i, "Vui lòng chọn tệp ảnh từ máy.");
export const optionalMediaUrlInput = z.union([z.string().trim().length(0), mediaUrlInput]);

export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

export function validateImageFile(file) {
    if (!file)
        return "Vui lòng chọn tệp ảnh.";
    const type = String(file.type || "").toLowerCase();
    const name = String(file.name || "");
    const typeOk = !type || ALLOWED_IMAGE_MIME.has(type);
    const extOk = !name || ALLOWED_IMAGE_EXT.test(name);
    if (!typeOk || !extOk || (!type && !ALLOWED_IMAGE_EXT.test(name)))
        return `Tệp "${name || "đã chọn"}" không đúng định dạng. Chỉ hỗ trợ JPG, PNG hoặc WebP.`;
    if (file.size === 0)
        return `Tệp "${name || "đã chọn"}" bị rỗng.`;
    if (file.size > MAX_IMAGE_UPLOAD_BYTES)
        return `Ảnh "${name || "đã chọn"}" vượt quá dung lượng tối đa 5MB.`;
    return null;
}

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
