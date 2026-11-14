import { Link } from "react-router";
import { useAuth } from "@/hooks/useAuth.js";
import { useOwnerCounts } from "@/hooks/useVehicles.js";
import { Icon } from "@/components/Icon.jsx";
import { accountRoleLabel, initials, resolveAssetUrl } from "@/utils/labels.js";

const groups = [
    { title: "Cài đặt tài khoản", links: [
            { section: "account", href: "/account", label: "Thông tin cá nhân", icon: "person" },
            { section: "verification", href: "/account/verification", label: "Xác minh giấy tờ", icon: "verified_user" },
        ] },
    { title: "Tin đăng và đánh giá", links: [
            { section: "reviews", href: "/my-reviews", label: "Đánh giá của tôi", icon: "reviews" },
            { section: "subscriptions", href: "/owner/subscriptions", label: "Gói đăng tin", icon: "workspace_premium", ownerOnly: true },
            { section: "owner", href: "/owner/dashboard", label: "Kênh chủ xe", icon: "garage_home", ownerOnly: true },
        ] },
];

export function ProfileSidebar({ active, className = "" }) {
    const { user, isOwner } = useAuth();
    const ownerCounts = useOwnerCounts(Boolean(user && isOwner));
    const roleLabel = accountRoleLabel(user, ownerCounts.approvedCars);
    const avatarSrc = resolveAssetUrl(user?.avatarUrl);
    return <aside className={`space-y-4 ${className}`} data-purpose="account-sidebar">
    <div className="relative overflow-hidden rounded-2xl border border-[#383830] bg-[#25251F] p-5 text-[#FAF8F2] shadow-md">
      <div className="pointer-events-none absolute -top-6 -right-6 size-28 rounded-full bg-[#FC6C26]/20 blur-2xl"/>
      <div className="relative flex items-center gap-3.5">
        {avatarSrc ? (
          <img src={avatarSrc} alt={user?.fullName || "Avatar"} className="size-13 shrink-0 rounded-2xl border border-white/20 object-cover shadow-sm"/>
        ) : (
          <span className="flex size-13 shrink-0 items-center justify-center rounded-2xl bg-[#FC6C26] text-base font-extrabold text-white shadow-sm">{initials(user?.fullName)}</span>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#A5A296]">Thành viên CarDB</p>
          <h2 className="truncate text-base font-bold text-[#FAF8F2]">{user?.fullName ?? "Khách"}</h2>
          <p className="mt-0.5 font-mono text-xs text-[#C7C4B8]">{user ? `${roleLabel} • #${user.id}` : "Chưa đăng nhập"}</p>
          {user?.role === "ADMIN" ? <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#FC6C26]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#FF9E6D]"><Icon name="admin_panel_settings" className="text-[12px]"/>Quản trị viên</span> : null}
        </div>
      </div>
    </div>

    <nav aria-label="Hồ sơ và tài khoản" className="space-y-3 rounded-2xl border border-[#E4E2D8] bg-white p-3 shadow-sm">
      {groups.map(group => <div key={group.title}>
        <h3 className="px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-widest text-[#868379]">{group.title}</h3>
        <div className="space-y-1">{group.links.filter(link => !link.ownerOnly || isOwner).map(link => {
            const selected = link.section === active;
            return <Link key={link.href} to={link.href} aria-current={selected ? "page" : undefined} className={`group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all ${selected ? "bg-[#25251F] font-semibold text-[#FAF8F2] shadow-sm" : "font-medium text-[#25251F] hover:bg-[#F3F1EA]"}`}>
              <Icon name={link.icon} className={`shrink-0 text-[19px] ${selected ? "text-[#FC6C26]" : "text-[#6C6C61] group-hover:text-[#FC6C26]"}`}/>
              <span className="min-w-0 flex-1 whitespace-nowrap text-sm">{link.label}</span>
              <Icon name="chevron_right" className={`text-[16px] ${selected ? "text-[#FAF8F2]/70" : "text-[#868379]"}`}/>
            </Link>;
        })}</div>
      </div>)}
    </nav>

    <div className="space-y-3 rounded-2xl border border-[#DEDAD0] bg-[#EAE6DC] p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#25251F] text-[#FC6C26] shadow-sm"><Icon name="support_agent"/></span>
        <div>
          <h3 className="text-sm font-bold text-[#25251F]">Hỗ trợ xác minh eKYC</h3>
          <p className="text-xs text-[#5C584F]">Ưu tiên duyệt nhanh trong giờ hành chính</p>
        </div>
      </div>
      <a href="tel:19008899" className="flex items-center justify-between rounded-xl border border-[#D6D3CB] bg-white px-4 py-3 text-[#25251F] shadow-sm transition-colors hover:border-[#FC6C26]">
        <span className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C6C61]">Tổng đài 24/7</span>
          <strong className="text-sm font-extrabold text-[#FC6C26]">1900 8899</strong>
        </span>
        <Icon name="call" className="text-[20px] text-[#FC6C26]"/>
      </a>
    </div>
  </aside>;
}
