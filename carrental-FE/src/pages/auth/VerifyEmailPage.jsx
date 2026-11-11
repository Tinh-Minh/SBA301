import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout.jsx";
import { resendVerification, verifyEmail } from "@/services/authService.js";

const PENDING_EMAIL_KEY = "cardb:pending-verification-email";

function verificationTokenFromLocation() {
    const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const query = new URLSearchParams(window.location.search);
    return fragment.get("token") || query.get("token");
}

export default function VerifyEmailPage() {
    const location = useLocation();
    const tokenRef = useRef(verificationTokenFromLocation());
    const [email, setEmail] = useState(() => location.state?.email || window.sessionStorage.getItem(PENDING_EMAIL_KEY) || "");
    const [status, setStatus] = useState(tokenRef.current ? "verifying" : "waiting");
    const [message, setMessage] = useState("");
    const [resendError, setResendError] = useState("");
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        const token = tokenRef.current;
        if (!token) return;
        tokenRef.current = null;
        // Verification tokens are bearer credentials. Remove them from browser history before calling the API.
        window.history.replaceState(window.history.state, "", window.location.pathname);
        verifyEmail(token).then(() => {
            setStatus("verified");
            setMessage("Email đã được xác minh. Bạn có thể đăng nhập.");
            window.sessionStorage.removeItem(PENDING_EMAIL_KEY);
        }).catch(error => {
            setStatus("failed");
            setMessage(error.message || "Liên kết xác minh không hợp lệ hoặc đã hết hạn.");
        });
    }, []);

    const onResend = async event => {
        event.preventDefault();
        setIsResending(true);
        setResendError("");
        try {
            await resendVerification(email);
            window.sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim());
            setStatus("sent");
            setMessage("Nếu email hợp lệ và chưa xác minh, liên kết mới sẽ được gửi tới hộp thư của bạn.");
        } catch (error) {
            setResendError(error.message || "Chưa gửi được email. Vui lòng thử lại sau.");
        } finally {
            setIsResending(false);
        }
    };

    return <AuthLayout>
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF0E8] text-[#FC6C26]">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="m3 7 9 6 9-6" />
                {status === "verified" ? <path d="m8.5 14.5 2 2 5-5" /> : null}
            </svg>
        </div>
        <h1>Xác minh email</h1>
        {status === "verifying" ? <p className="mt-3 text-sm text-[#666666]" role="status">Đang xác minh liên kết…</p> : null}
        {message ? <p className={`mt-3 text-sm ${status === "failed" ? "text-red-700" : "text-[#666666]"}`} role={status === "failed" ? "alert" : "status"}>{message}</p> : null}
        {status === "waiting" ? <p className="mt-3 text-sm text-[#666666]">
            {email ? <>Hãy mở liên kết xác minh đã gửi tới <strong>{email}</strong>.</> : "Mở liên kết trong email CarDB để hoàn tất đăng ký."}
        </p> : null}
        {status !== "verified" ? <form className="auth-form mt-6" onSubmit={onResend}>
            <div className="auth-field-group">
                <label htmlFor="verification-email">Gửi lại liên kết tới email</label>
                <div className="auth-control">
                    <span className="material-symbols-outlined" aria-hidden="true">mail</span>
                    <input className="auth-field" id="verification-email" type="email" autoComplete="email" required maxLength={150}
                        placeholder="name@example.com" value={email} onChange={event => setEmail(event.target.value)} />
                </div>
            </div>
            {resendError ? <p className="text-sm text-red-700" role="alert">{resendError}</p> : null}
            <button className="auth-submit" type="submit" disabled={isResending || !email.trim()}>
                {isResending ? "Đang gửi…" : "Gửi lại liên kết"}
            </button>
        </form> : null}
        <p className="auth-switch">
            {status === "verified" ? <Link to="/login">Đăng nhập</Link> : <Link to="/login">Quay lại đăng nhập</Link>}
        </p>
    </AuthLayout>;
}
