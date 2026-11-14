import { Link } from "react-router";
import { AuthLayout } from "@/components/auth/AuthLayout.jsx";
import { RegisterForm } from "@/components/auth/RegisterForm.jsx";

export default function RegisterPage() {
    return <AuthLayout>
        <h1>Tạo tài khoản</h1>
        <RegisterForm />
        <p className="auth-switch">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </AuthLayout>;
}
