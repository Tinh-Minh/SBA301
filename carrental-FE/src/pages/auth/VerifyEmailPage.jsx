import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout.jsx";
import { resendVerification, verifyEmail } from "@/services/authService.js";

const PENDING_EMAIL_KEY = "cardb:pending-verification-email";
const RESEND_COOLDOWN_SECONDS = 60;

function resendCooldownFromError(error) {
    if (error?.status !== 429 && error?.code !== "TOO_MANY_REQUESTS") return 0;

    const message = String(error?.message || "");
    const seconds = message.match(/(\d+)\s*(?:giây|seconds?)/i);
    if (seconds) return Math.max(1, Number(seconds[1]));
    if (/vài giây/i.test(message)) return 5;
    if (/trong 10 phút/i.test(message)) return 10 * 60;
    return RESEND_COOLDOWN_SECONDS;
}

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
    const [resendCooldown, setResendCooldown] = useState({ email: "", until: 0 });
    const [now, setNow] = useState(() => Date.now());
    const normalizedEmail = email.trim().toLowerCase();
    const resendSeconds = resendCooldown.email === normalizedEmail
        ? Math.max(0, Math.ceil((resendCooldown.until - now) / 1000))
        : 0;
    const isResendCoolingDown = resendSeconds > 0;

    useEffect(() => {
        if (!isResendCoolingDown) return undefined;
        const timer = window.setInterval(() => {
            const currentTime = Date.now();
            setNow(currentTime);
            if (currentTime >= resendCooldown.until) {
                window.clearInterval(timer);
            }
        }, 1000);
        return () => window.clearInterval(timer);
    }, [resendCooldown.until, isResendCoolingDown]);

    const startResendCooldown = seconds => {
        const currentTime = Date.now();
        setNow(currentTime);
        setResendCooldown({ email: normalizedEmail, until: currentTime + seconds * 1000 });
    };

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
        if (isResending || resendSeconds > 0 || !normalizedEmail) return;

        setIsResending(true);
        setResendError("");
        try {
            await resendVerification(email);
            window.sessionStorage.setItem(PENDING_EMAIL_KEY, email.trim());
            setStatus("sent");
            setMessage("Nếu email hợp lệ và chưa xác minh, liên kết mới sẽ được gửi tới hộp thư của bạn.");
            startResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (error) {
            setResendError(error.message || "Chưa gửi được email. Vui lòng thử lại sau.");
            const cooldownSeconds = resendCooldownFromError(error);
            if (cooldownSeconds > 0) startResendCooldown(cooldownSeconds);
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
                        placeholder="name@example.com" value={email} onChange={event => {
                            setEmail(event.target.value);
                        }} />
                </div>
            </div>
            {resendError ? <p className="text-sm text-red-700" role="alert">{resendError}</p> : null}
            <button className="auth-submit" type="submit" disabled={isResending || resendSeconds > 0 || !normalizedEmail}>
                {isResending ? "Đang gửi…" : resendSeconds > 0 ? `Gửi lại sau ${resendSeconds} giây` : "Gửi lại liên kết"}
            </button>
        </form> : null}
        <p className="auth-switch">
            {status === "verified" ? <Link to="/login">Đăng nhập</Link> : <Link to="/login">Quay lại đăng nhập</Link>}
        </p>
    </AuthLayout>;
}
