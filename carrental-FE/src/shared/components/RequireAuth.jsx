import { Link, useLocation } from "react-router";
import { useAuth } from "@/shared/hooks/useAuth.js";
import { Icon } from "@/shared/components/Icon.jsx";

/** Chặn nội dung cần đăng nhập (và tùy chọn quyền ADMIN) — backend trả 401/403 nếu thiếu JWT. */
export function RequireAuth({ children, admin = false, title = "Vui lòng đăng nhập" }) {
    const { ready, loggedIn, isAdmin } = useAuth();
    const path = useLocation().pathname;
    if (!ready)
        return <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#666666]">Đang kiểm tra phiên đăng nhập…</div>;
    if (!loggedIn)
        return <Gate icon="lock" title={title} body="Trang này lấy dữ liệu trực tiếp từ hệ thống CarDB nên cần đăng nhập tài khoản của bạn." action={<Link to={`/login?next=${encodeURIComponent(path)}`} className="inline-flex items-center gap-2 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]">Đăng nhập<Icon name="arrow_forward" className="text-[18px]"/></Link>}/>;
    if (admin && !isAdmin)
        return <Gate icon="admin_panel_settings" title="Chỉ dành cho quản trị viên" body="Tài khoản hiện tại không có quyền ADMIN. Đăng nhập bằng tài khoản quản trị để tiếp tục." action={<Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E9E7] bg-white px-5 py-2.5 text-sm font-bold text-[#292929]">Về trang chủ</Link>}/>;
    return children;
}

function Gate({ icon, title, body, action }) {
    return <div className="mx-auto my-10 flex max-w-lg flex-col items-center gap-3 rounded-2xl border border-[#E9E9E7] bg-white p-8 text-center shadow-sm">
    <span className="flex size-12 items-center justify-center rounded-full bg-[#FFF2EB] text-[#FC6C26]"><Icon name={icon}/></span>
    <h2 className="text-xl font-bold text-[#292929]">{title}</h2>
    <p className="text-sm text-[#666666]">{body}</p>
    {action}
  </div>;
}
