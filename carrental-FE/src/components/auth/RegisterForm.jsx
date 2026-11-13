import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth.js";
import { usePasswordStrength } from "@/hooks/usePasswordStrength.js";
import { FormErrors } from "@/components/FormErrors.jsx";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter.jsx";
import { registrationSchema } from "@/utils/schemas/registration.js";
import { Link, useNavigate } from "react-router";

const fieldClass = "auth-field";
const PENDING_EMAIL_KEY = "cardb:pending-verification-email";
const VERIFICATION_LAST_SENT_AT_KEY = "cardb:verification-last-sent-at";

export function RegisterForm() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const { register: createAccount } = useAuth();
    const { register, control, handleSubmit, setError, formState: { errors, isSubmitting, isValid } } = useForm({
        resolver: zodResolver(registrationSchema),
        mode: "onChange",
        defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "", terms: false },
    });
    const watched = useWatch({ control, name: ["fullName", "email", "phone", "password"] });
    const [fullName = "", email = "", phone = "", password = ""] = watched ?? [];
    const strength = usePasswordStrength({ password, fullName, email, phone });
    const onSubmit = handleSubmit(async ({ confirmPassword, terms, ...values }) => {
        try {
            await createAccount(values);
            const email = values.email.trim();
            window.sessionStorage.setItem(PENDING_EMAIL_KEY, email);
            window.sessionStorage.setItem(VERIFICATION_LAST_SENT_AT_KEY, String(Date.now()));
            navigate("/verify-email", { state: { email } });
        } catch (error) {
            setError("root.server", { message: error.message });
        }
    });

    return <form data-native noValidate onSubmit={onSubmit} aria-busy={isSubmitting} className="auth-form">
        <div className="auth-field-group">
            <label htmlFor="reg-fullname">Họ và tên <span className="auth-required">*</span></label>
            <div className="auth-control">
                <span className="material-symbols-outlined" aria-hidden="true">person</span>
                <input className={fieldClass} id="reg-fullname" placeholder="Nguyễn Văn A" required type="text" autoComplete="name" aria-label="Họ và tên" {...register("fullName")} aria-invalid={Boolean(errors.fullName)} />
            </div>
        </div>
        <div className="auth-field-pair">
            <div className="auth-field-group">
                <label htmlFor="reg-email">Email <span className="auth-required">*</span></label>
                <div className="auth-control">
                    <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                    <input className={fieldClass} id="reg-email" placeholder="name@example.com" required type="email" autoComplete="email" aria-label="Email" {...register("email")} aria-invalid={Boolean(errors.email)} />
                </div>
            </div>
            <div className="auth-field-group">
                <label htmlFor="reg-phone">Số điện thoại <span className="auth-required">*</span></label>
                <div className="auth-control">
                    <span className="material-symbols-outlined" aria-hidden="true">phone</span>
                    <input className={fieldClass} id="reg-phone" placeholder="0912 345 678" required type="tel" autoComplete="tel" aria-label="Số điện thoại" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
                </div>
            </div>
        </div>
        <div className="auth-field-group">
            <label htmlFor="reg-password">Mật khẩu <span className="auth-required">*</span></label>
            <div className="auth-control">
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                <input className={`${fieldClass} auth-field--action`} id="reg-password" placeholder="Cụm từ dài, dễ nhớ với bạn" required type={passwordVisible ? "text" : "password"} autoComplete="new-password" aria-label="Mật khẩu" aria-describedby="reg-password-strength" {...register("password")} aria-invalid={Boolean(errors.password)} />
                <button aria-label="Hiện hoặc ẩn mật khẩu" type="button" onClick={() => setPasswordVisible(visible => !visible)}>
                    <span className="material-symbols-outlined">{passwordVisible ? "visibility_off" : "visibility"}</span>
                </button>
            </div>
            <PasswordStrengthMeter strength={strength} />
        </div>
        <div className="auth-field-group">
            <label htmlFor="reg-confirm-password">Xác nhận mật khẩu <span className="auth-required">*</span></label>
            <div className="auth-control">
                <span className="material-symbols-outlined" aria-hidden="true">lock_reset</span>
                <input className={`${fieldClass} auth-field--action`} id="reg-confirm-password" placeholder="Nhập lại mật khẩu" required type={confirmVisible ? "text" : "password"} autoComplete="new-password" aria-label="Nhập lại mật khẩu" {...register("confirmPassword")} aria-invalid={Boolean(errors.confirmPassword)} />
                <button aria-label="Hiện hoặc ẩn mật khẩu xác nhận" type="button" onClick={() => setConfirmVisible(visible => !visible)}>
                    <span className="material-symbols-outlined">{confirmVisible ? "visibility_off" : "visibility"}</span>
                </button>
            </div>
        </div>
        <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
                <input className="mt-0.5 w-4 h-4 rounded border-[#E9E9E7] text-[#FC6C26] focus:ring-[#FC6C26] cursor-pointer shrink-0" id="reg-terms" required type="checkbox" {...register("terms")} aria-invalid={Boolean(errors.terms)} />
                <span className="text-[12px] text-[#666666] leading-tight">{"Tôi đồng ý với "}<Link className="text-[#FC6C26] hover:text-[#B9430C] hover:underline font-medium" to="/terms-of-service">{"Điều khoản sử dụng"}</Link>{" và "}<Link className="text-[#FC6C26] hover:text-[#B9430C] hover:underline font-medium" to="/privacy-policy">{"Chính sách bảo mật"}</Link>{" của CarDB "}<span className="text-[#FC6C26]">{"*"}</span></span>
            </label>
        </div>
        <button className="auth-submit" type="submit" disabled={isSubmitting || !isValid}>{isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button>
        <FormErrors errors={errors} />
    </form>;
}
