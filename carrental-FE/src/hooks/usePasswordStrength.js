import { useMemo } from "react";
import { evaluatePasswordStrength } from "@/utils/passwordStrength.js";

/** Tính lại độ mạnh khi mật khẩu hoặc thông tin cá nhân trên form đổi. */
export function usePasswordStrength({ password = "", fullName = "", email = "", phone = "" } = {}) {
    return useMemo(
        () => evaluatePasswordStrength({ password, fullName, email, phone }),
        [password, fullName, email, phone],
    );
}
