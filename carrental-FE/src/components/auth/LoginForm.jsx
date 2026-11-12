import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth.js";
import { useNotice } from "@/context/NoticeProvider.jsx";
import { FormErrors } from "@/components/FormErrors.jsx";
import { loginSchema } from "@/utils/schemas/auth.js";
import { Link, useNavigate, useSearchParams } from "react-router";

export function LoginForm() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const { login } = useAuth();
    const notify = useNotice();
    const [search] = useSearchParams();
    const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" },
    });
    const onSubmit = handleSubmit(async values => {
        try {
            const session = await login(values);
            notify("Đăng nhập thành công.");
            const next = search.get("next");
            const defaultHome = session.account.role === "ADMIN"
                ? "/admin/dashboard"
                : session.account.role === "OWNER"
                    ? "/owner/dashboard"
                    : "/explore";
            navigate(next && next.startsWith("/") ? next : defaultHome);
        } catch (error) {
            const message = error.message || (error.status === 401 ? "Email hoặc mật khẩu không đúng." : "Đăng nhập thất bại.");
            setError("root.server", { message });
            notify(message, "error");
        }
    });

    return <form data-native noValidate onSubmit={onSubmit} aria-busy={isSubmitting} className="auth-form">
        <div className="auth-field-group">
            <label htmlFor="login-account">Email</label>
            <div className="auth-control">
                <span className="material-symbols-outlined" aria-hidden="true">alternate_email</span>
                <input className="auth-field" id="login-account" placeholder="name@example.com" required type="email" inputMode="email" autoComplete="username" aria-label="Email" {...register("email")} aria-invalid={Boolean(errors.email)} />
            </div>
        </div>
        <div className="auth-field-group">
            <div className="auth-label-row">
                <label htmlFor="login-password">Mật khẩu</label>
                <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
            <div className="auth-control">
                <span className="material-symbols-outlined" aria-hidden="true">lock</span>
                <input className="auth-field auth-field--action" id="login-password" placeholder="Nhập mật khẩu của bạn" required type={passwordVisible ? "text" : "password"} autoComplete="current-password" aria-label="Mật khẩu" {...register("password")} aria-invalid={Boolean(errors.password)} />
                <button aria-label="Hiện hoặc ẩn mật khẩu" type="button" onClick={() => setPasswordVisible(visible => !visible)}>
                    <span className="material-symbols-outlined">{passwordVisible ? "visibility_off" : "visibility"}</span>
                </button>
            </div>
        </div>
        <button className="auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</button>
        <FormErrors errors={errors} />
    </form>;
}
