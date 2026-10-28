import { z } from "zod";
import { parseVndInput } from "@/utils/inputParser.js";

export const requiredText = (message) => z.string().trim().min(1, message);
export const emailInput = z.string().trim().regex(/^\S+@\S+\.\S+$/, "Vui lòng nhập email hợp lệ.");
export const httpUrlInput = z.string().trim().max(500, "Đường dẫn tối đa 500 ký tự.")
    .regex(/^https?:\/\/\S+$/i, "Đường dẫn phải bắt đầu bằng http:// hoặc https://.");
export const optionalHttpUrlInput = z.union([z.string().trim().length(0), httpUrlInput]);

export function vndInput({ positive = false } = {}) {
    return z.preprocess(parseVndInput, z.number({ error: "Vui lòng nhập số VND nguyên hợp lệ." })
        .int().min(positive ? 1 : 0, positive ? "Giá trị phải lớn hơn 0." : "Giá trị không được âm.")
        .max(Number.MAX_SAFE_INTEGER, "Giá trị quá lớn."));
}

export function integerInput(min, max) {
    return z.preprocess(value => String(value ?? "").trim() === "" ? undefined : Number(value),
        z.number({ error: "Vui lòng nhập số nguyên." }).int().min(min).max(max));
}

export function validateInput(schema, input) {
    return schema.safeParse(input);
}
