import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth.js";
import { usePasswordStrength } from "@/hooks/usePasswordStrength.js";
import { FormErrors } from "@/components/FormErrors.jsx";
import { PasswordStrengthMeter } from "@/components/PasswordStrengthMeter.jsx";
import { registrationSchema } from "@/utils/schemas/registration.js";
import { Link, useNavigate } from "react-router";

const fieldClass = "w-full bg-white/70 border border-[#E9E9E7] text-[#292929] placeholder:text-[#666666]/60 rounded-xl transition-all focus:outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20";

export function RegisterForm() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const { register: createAccount, login } = useAuth();
    const { register, control, handleSubmit, setError, formState: { errors, isSubmitting, isValid } } = useForm({
        resolver: zodResolver(registrationSchema),
        mode: "onChange",
        defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "", terms: true },
    });
    const watched = useWatch({ control, name: ["fullName", "email", "phone", "password"] });
    const [fullName = "", email = "", phone = "", password = ""] = watched ?? [];
    const strength = usePasswordStrength({ password, fullName, email, phone });
    const onSubmit = handleSubmit(async ({ confirmPassword, terms, ...values }) => {
        try {
            await createAccount(values);
            await login({ email: values.email, password: values.password });
            navigate("/account");
        } catch (error) {
            setError("root.server", { message: error.message });
        }
    });

    return <form data-native noValidate onSubmit={onSubmit} aria-busy={isSubmitting} className="space-y-3">
        <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[#292929]" htmlFor="reg-fullname">{"Họ và tên "}<span className="text-[#FC6C26]">{"*"}</span></label>
            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"person"}</span>
                <input className={`${fieldClass} pl-11 pr-4 py-2 text-[14px]`} id="reg-fullname" placeholder="Nguyễn Văn A" required type="text" aria-label="Nguyễn Văn A" {...register("fullName")} aria-invalid={Boolean(errors.fullName)} />
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
                <label className="block text-[13px] font-medium text-[#292929]" htmlFor="reg-email">{"Email "}<span className="text-[#FC6C26]">{"*"}</span></label>
                <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"mail"}</span>
                    <input className={`${fieldClass} pl-10 pr-3 py-2 text-[13px]`} id="reg-email" placeholder="name@example.com" required type="email" aria-label="name@example.com" {...register("email")} aria-invalid={Boolean(errors.email)} />
                </div>
            </div>
            <div className="space-y-1">
                <label className="block text-[13px] font-medium text-[#292929]" htmlFor="reg-phone">{"Số điện thoại "}<span className="text-[#FC6C26]">{"*"}</span></label>
                <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"phone"}</span>
                    <input className={`${fieldClass} pl-10 pr-3 py-2 text-[13px]`} id="reg-phone" placeholder="0912 345 678" required type="tel" aria-label="0912 345 678" {...register("phone")} aria-invalid={Boolean(errors.phone)} />
                </div>
            </div>
        </div>
        <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[#292929]" htmlFor="reg-password">{"Mật khẩu "}<span className="text-[#FC6C26]">{"*"}</span></label>
            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"lock"}</span>
                <input className={`${fieldClass} pl-10 pr-9 py-2 text-[13px]`} id="reg-password" placeholder="Cụm từ dài, dễ nhớ với bạn" required type={passwordVisible ? "text" : "password"} autoComplete="new-password" aria-label="Mật khẩu" aria-describedby="reg-password-strength" {...register("password")} aria-invalid={Boolean(errors.password)} />
                <button aria-label="Hiện hoặc ẩn mật khẩu" className="absolute right-2.5 text-[#666666] hover:text-[#292929] p-1 rounded transition-colors" type="button" onClick={() => setPasswordVisible(visible => !visible)}>
                    <span className="material-symbols-outlined text-[18px]">{"visibility"}</span>
                </button>
            </div>
            <PasswordStrengthMeter strength={strength} />
        </div>
        <div className="space-y-1">
            <label className="block text-[13px] font-medium text-[#292929]" htmlFor="reg-confirm-password">{"Xác nhận mật khẩu "}<span className="text-[#FC6C26]">{"*"}</span></label>
            <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"lock_reset"}</span>
                <input className={`${fieldClass} pl-10 pr-9 py-2 text-[13px]`} id="reg-confirm-password" placeholder="Nhập lại mật khẩu" required type={confirmVisible ? "text" : "password"} autoComplete="new-password" aria-label="Nhập lại mật khẩu" {...register("confirmPassword")} aria-invalid={Boolean(errors.confirmPassword)} />
                <button aria-label="Hiện hoặc ẩn mật khẩu xác nhận" className="absolute right-2.5 text-[#666666] hover:text-[#292929] p-1 rounded transition-colors" type="button" onClick={() => setConfirmVisible(visible => !visible)}>
                    <span className="material-symbols-outlined text-[18px]">{"visibility"}</span>
                </button>
            </div>
        </div>
        <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
                <input className="mt-0.5 w-4 h-4 rounded border-[#E9E9E7] text-[#FC6C26] focus:ring-[#FC6C26] cursor-pointer shrink-0" id="reg-terms" required type="checkbox" {...register("terms")} aria-invalid={Boolean(errors.terms)} />
                <span className="text-[12px] text-[#666666] leading-tight">{"Tôi đồng ý với "}<Link className="text-[#FC6C26] hover:text-[#B9430C] hover:underline font-medium" to="/terms-of-service">{"Điều khoản sử dụng"}</Link>{" và "}<Link className="text-[#FC6C26] hover:text-[#B9430C] hover:underline font-medium" to="/privacy-policy">{"Chính sách bảo mật"}</Link>{" của CarDB "}<span className="text-[#FC6C26]">{"*"}</span></span>
            </label>
        </div>
        <button className="w-full mt-2 py-3 px-6 rounded-xl text-[14px] font-bold bg-[#FC6C26] hover:bg-[#B9430C] hover:text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer text-white disabled:cursor-not-allowed disabled:opacity-60" type="submit" aria-label="Đăng ký tài khoản" disabled={isSubmitting || !isValid}>
            <span>{"Đăng ký tài khoản"}</span>
            <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">{"arrow_forward"}</span>
        </button>
        <FormErrors errors={errors} />
    </form>;
}
