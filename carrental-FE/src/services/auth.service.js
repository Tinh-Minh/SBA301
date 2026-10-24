import { request } from "./http";
import { clearSession, saveSession } from "@/shared/storage/session.js";

/** POST /api/auth/login — backend chỉ nhận email + mật khẩu. */
export async function login({ email, password }) {
    const token = await request("/api/auth/login", { method: "POST", auth: false, json: { email: email.trim(), password } });
    return saveSession(token);
}

/** POST /api/auth/register → trả về hồ sơ khách hàng vừa tạo. */
export function register({ fullName, email, phone, password }) {
    return request("/api/auth/register", {
        method: "POST",
        auth: false,
        json: { fullName: fullName.trim(), email: email.trim(), phone: phone.trim().replace(/\s+/g, ""), password },
    });
}

/** POST /api/auth/change-password — cần JWT. */
export function changePassword({ currentPassword, newPassword }) {
    return request("/api/auth/change-password", { method: "POST", json: { currentPassword, newPassword } });
}

export function logout() {
    clearSession();
}
