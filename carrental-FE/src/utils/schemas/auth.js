import { z } from "zod";
import { emailInput } from "@/utils/validateInput.js";

export const loginSchema = z.object({
    email: emailInput,
    password: z.string().min(1, "Vui lòng nhập mật khẩu."),
});
