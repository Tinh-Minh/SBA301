import { z } from "zod";
import { emailInput, requiredText } from "../utils/validateInput.js";

export const loginSchema = z.object({
    email: emailInput,
    password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});

export const registrationSchema = z.object({
    fullName: requiredText("Vui lòng nhập họ tên."),
    email: emailInput,
    phone: requiredText("Vui lòng nhập số điện thoại."),
    password: z.string().min(8, "Mật khẩu cần ít nhất 8 ký tự."),
    confirmPassword: z.string(),
    terms: z.literal(true, { error: "Vui lòng đồng ý với điều khoản sử dụng." }),
}).refine(value => value.password === value.confirmPassword, {
    path: ["confirmPassword"], message: "Mật khẩu xác nhận chưa khớp.",
});
