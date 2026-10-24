import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/shared/hooks/useAuth.js";
import { FormErrors } from "@/shared/components/FormErrors.jsx";
import { loginSchema } from "@/shared/schemas/auth.js";
import { Link, useNavigate, useSearchParams } from "react-router";

export function LoginForm() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);

    const { login } = useAuth();
    const [search] = useSearchParams();
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" },
    });
    const onSubmit = handleSubmit(async values => {
        try {
            const session = await login(values);
            const next = search.get("next");
            navigate(next && next.startsWith("/") ? next : session.account.role === "ADMIN" ? "/admin/dashboard" : "/explore");
        } catch (error) {
            setError("root.server", { message: error.status === 401 ? "Email hoặc mật khẩu không đúng." : error.message });
        }
    });

    return (<form data-native noValidate onSubmit={onSubmit} aria-busy={isSubmitting} className="space-y-4"><div className="space-y-1.5"><label className="block text-[13px] font-medium text-[#292929]" htmlFor="login-account">{"Email hoặc số điện thoại"}</label><div className="relative flex items-center"><span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"alternate_email"}</span><input className="w-full pl-11 pr-4 py-2.5 bg-white/70 border border-[#E9E9E7] text-[#292929] placeholder:text-[#666666]/60 text-[14px] rounded-xl transition-all focus:outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20" id="login-account" placeholder="name@example.com hoặc 0912..." required={true} type="text" aria-label="name@example.com hoặc 0912..." {...register("email")} aria-invalid={Boolean(errors.email)} /></div></div><div className="space-y-1.5"><div className="flex items-center justify-between"><label className="text-[13px] font-medium text-[#292929]" htmlFor="login-password">{"Mật khẩu"}</label><Link className="text-[12px] text-[#FC6C26] hover:text-[#B9430C] font-medium transition-colors" to="/forgot-password">{"Quên mật khẩu?"}</Link></div><div className="relative flex items-center"><span className="material-symbols-outlined absolute left-3.5 text-[#666666] text-[19px]">{"lock"}</span><input className="w-full pl-11 pr-11 py-2.5 bg-white/70 border border-[#E9E9E7] text-[#292929] placeholder:text-[#666666]/60 text-[14px] rounded-xl transition-all focus:outline-none focus:border-[#FC6C26] focus:ring-2 focus:ring-[#FC6C26]/20" id="login-password" placeholder="Nhập mật khẩu của bạn" required={true} type={passwordVisible ? "text" : "password"} aria-label="Nhập mật khẩu của bạn" {...register("password")} aria-invalid={Boolean(errors.password)} /><button aria-label="Hiện hoặc ẩn mật khẩu" className="absolute right-3 text-[#666666] hover:text-[#292929] p-1 rounded-md transition-colors" type="button" onClick={() => setPasswordVisible(visible => !visible)}><span className="material-symbols-outlined text-[19px]" id="login-eye-icon">{"visibility"}</span></button></div></div><div className="flex items-center justify-between pt-1"><label className="flex items-center gap-2 cursor-pointer select-none"><input className="w-4 h-4 rounded border-[#E9E9E7] text-[#FC6C26] focus:ring-[#FC6C26] cursor-pointer" name="remember-me" type="checkbox" defaultChecked={true}/><span className="text-[13px] text-[#666666]">{"Ghi nhớ đăng nhập trên thiết bị này"}</span></label></div><button className="ui-action w-full mt-2 py-3 px-6 rounded-xl text-[14px] font-bold bg-[#FC6C26] hover:bg-[#B9430C] text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer" type="submit" aria-label="Đăng nhập" disabled={isSubmitting}><span className="">{"Đăng nhập"}</span><span className="material-symbols-outlined text-[19px] group-hover:translate-x-1 transition-transform">{"arrow_forward"}</span></button><FormErrors errors={errors} /></form>);
}
