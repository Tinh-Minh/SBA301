import { endpoints } from "@/services/endpoints.js";
import { request } from "@/services/api.js";
import { saveSession } from "@/utils/session.js";

/** POST /api/auth/login — backend chỉ nhận email + mật khẩu. */
export async function authenticate({ email, password }) {
    const token = await request(endpoints.auth.login, { method: "POST", auth: false, json: { email: email.trim(), password } });
    return saveSession(token);
}

/** POST /api/auth/register → trả về hồ sơ khách hàng vừa tạo. */
export function registerAccount({ fullName, email, phone, password }) {
    return request(endpoints.auth.register, {
        method: "POST",
        auth: false,
        json: { fullName: fullName.trim(), email: email.trim(), phone: phone.trim().replace(/\s+/g, ""), password },
    });
}

/** POST /api/auth/verify-email — token chỉ được gửi trong body, không dùng Authorization. */
export function verifyEmail(token) {
    return request(endpoints.auth.verifyEmail, { method: "POST", auth: false, json: { token } });
}

/** POST /api/auth/resend-verification — phản hồi luôn chung để tránh dò email tồn tại. */
export function resendVerification(email) {
    return request(endpoints.auth.resendVerification, {
        method: "POST",
        auth: false,
        json: { email: email.trim() },
    });
}
