import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth.js";
import { Icon } from "@/components/Icon.jsx";

/** Chặn nội dung cần đăng nhập (và tùy chọn quyền ADMIN / OWNER) — backend trả 401/403 nếu thiếu JWT hoặc sai role. */
export function RequireAuth({ children, admin = false, owner = false, title = "Vui lòng đăng nhập" }) {
    const { ready, loggedIn, isAdmin, isOwner, user, refreshAccount } = useAuth();
    const [checking, setChecking] = useState(false);
    const path = useLocation().pathname;
    useEffect(() => {
        if (ready && loggedIn && owner && !isOwner && !isAdmin) {
            void refreshAccount();
        }
    }, [ready, loggedIn, owner, isOwner, isAdmin, refreshAccount]);

    async function handleRecheck() {
        setChecking(true);
        try {
            await refreshAccount();
        }
        finally {
            setChecking(false);
        }
    }

    if (!ready)
        return <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#666666]">Đang kiểm tra phiên đăng nhập…</div>;
    if (!loggedIn)
        return <Gate icon="lock" title={title} body="Trang này lấy dữ liệu trực tiếp từ hệ thống CarDB nên cần đăng nhập tài khoản của bạn." action={<Link to={`/login?next=${encodeURIComponent(path)}`} className="inline-flex items-center gap-2 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]">Đăng nhập<Icon name="arrow_forward" className="text-[18px]"/></Link>}/>;
    if (admin && !isAdmin)
        return <Gate icon="admin_panel_settings" title="Chỉ dành cho quản trị viên" body="Tài khoản hiện tại không có quyền ADMIN. Đăng nhập bằng tài khoản quản trị để tiếp tục." action={<Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E9E7] bg-white px-5 py-2.5 text-sm font-bold text-[#292929]">Về trang chủ</Link>}/>;
    if (owner && !isOwner) {
        if (isAdmin) {
            return <Gate icon="directions_car" title="Kênh này chỉ dành cho Chủ xe" body="Tài khoản quản trị viên (ADMIN) không thuộc vai trò Chủ xe. Hãy dùng trang Quản trị hoặc đăng nhập bằng tài khoản Chủ xe (OWNER)." action={<div className="flex flex-wrap justify-center gap-2"><Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]">Vào trang Quản trị</Link><Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E9E7] bg-white px-5 py-2.5 text-sm font-bold text-[#292929]">Về trang chủ</Link></div>}/>;
        }
        return <Gate icon="directions_car" title="Đăng ký xe để trở thành Chủ xe" body={`Tài khoản ${user?.fullName ? `"${user.fullName}" ` : ""}hiện đang ở vai trò Khách hàng (CUSTOMER). Để nâng cấp lên Chủ xe (OWNER) và mở tính năng cho thuê xe, bạn cần đăng ký xe kèm đầy đủ giấy tờ xe, đăng kiểm, bảo hiểm và chờ Admin phê duyệt.`} action={<div className="flex flex-wrap justify-center gap-2"><Link to="/account/verification" className="inline-flex items-center gap-2 rounded-xl bg-[#FC6C26] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#e55915]">Đăng ký xe nâng cấp Chủ xe<Icon name="arrow_forward" className="text-[18px]"/></Link><button type="button" disabled={checking} onClick={handleRecheck} className="inline-flex items-center gap-2 rounded-xl border border-[#E9E9E7] bg-white px-4 py-2.5 text-sm font-bold text-[#292929] hover:bg-[#F7F7F5] disabled:opacity-60">{checking ? "Đang kiểm tra…" : "Kiểm tra lại trạng thái"}</button><Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-[#E9E9E7] bg-white px-4 py-2.5 text-sm font-bold text-[#292929]">Về trang chủ</Link></div>}/>;
    }
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
