import { Link } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout.jsx";
import { LoginForm } from "@/components/auth/LoginForm.jsx";

export default function LoginPage() {
    return <AuthLayout>
        <h1>Đăng nhập</h1>
        <LoginForm />
        <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Đăng ký</Link></p>
    </AuthLayout>;
}
