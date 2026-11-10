import { z } from "zod";
import { emailInput, requiredText } from "@/utils/validateInput.js";
import { evaluatePasswordStrength } from "@/utils/passwordStrength.js";

export const registrationSchema = z.object({
    fullName: requiredText("Vui lòng nhập họ tên."),
    email: emailInput,
    phone: requiredText("Vui lòng nhập số điện thoại."),
    password: z.string(),
    confirmPassword: z.string(),
    terms: z.literal(true, { error: "Vui lòng đồng ý với điều khoản sử dụng." }),
}).superRefine((value, ctx) => {
    const strength = evaluatePasswordStrength(value);
    if (strength.tooShort || strength.tooLong) {
        ctx.addIssue({ code: "custom", path: ["password"], message: strength.message });
    }
    if (value.password !== value.confirmPassword) {
        ctx.addIssue({ code: "custom", path: ["confirmPassword"], message: "Mật khẩu xác nhận chưa khớp." });
    }
});
