import Link from "next/link";
import { Icon } from "./icon";

export type ProfileSection = "account" | "verification" | "driver" | "banks" | "orders" | "history";
const groups = [
  { title: "Cài đặt tài khoản", links: [
    { section: "account", href: "/tai-khoan", label: "Thông tin cá nhân", icon: "person" },
    { section: "verification", href: "/tai-khoan/xac-minh", label: "Xác minh giấy tờ", icon: "verified_user", count: "1" },
    { section: "driver", href: "/tai-khoan/ho-so-tai-xe", label: "Hồ sơ tài xế", icon: "badge" },
    { section: "banks", href: "/tai-khoan/ngan-hang", label: "Tài khoản ngân hàng", icon: "account_balance", count: "2" },
  ] },
  { title: "Quản lý chuyến đi", links: [
    { section: "orders", href: "/tai-khoan/don-thue", label: "Đơn thuê xe", icon: "directions_car", count: "1" },
    { section: "history", href: "/tai-khoan/lich-su", label: "Lịch sử chuyến đi", icon: "history" },
  ] },
];

export function ProfileSidebar({ active, className = "" }: { active: ProfileSection; className?: string }) {
  return <aside className={`space-y-4 ${className}`} data-purpose="account-sidebar">
    <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm">
      <div className="pointer-events-none absolute -top-4 -right-4 size-24 rounded-full bg-gradient-to-br from-primary-container/10 to-transparent blur-xl" />
      <div className="flex items-center gap-4">
        <div className="relative shrink-0"><img className="size-14 rounded-full object-cover shadow-sm ring-2 ring-primary-container/20" src="/images/cardb-5e45d798899a87c8.webp" alt="Ảnh đại diện Nguyễn Hoàng Minh" width="56" height="56" loading="lazy" decoding="async" /><span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"><Icon name="stars" className="text-[14px]" /></span></div>
        <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold text-on-surface">Nguyễn Hoàng Minh</h2><p className="mt-0.5 text-xs text-on-surface-variant">CDB-VN-88492</p><span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-secondary-fixed px-2 py-0.5 text-[10px] font-semibold text-on-secondary-fixed"><Icon name="workspace_premium" className="text-[12px]" />Thành viên cao cấp</span></div>
      </div>
    </div>
    <nav aria-label="Hồ sơ và tài khoản" className="space-y-4 rounded-xl bg-surface-container-lowest p-2 shadow-sm">
      {groups.map(group => <div key={group.title}><h3 className="px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{group.title}</h3><div className="space-y-1">{group.links.map(link => {
        const selected = link.section === active;
        return <Link key={link.href} href={link.href} aria-current={selected ? "page" : undefined} className={`group flex items-center gap-2 rounded-lg px-4 py-2.5 transition-colors ${selected ? "bg-primary-fixed/50 font-semibold text-primary-container shadow-sm" : "text-on-surface hover:bg-surface-container-low"}`}><Icon name={link.icon} className={`shrink-0 text-[20px] ${selected ? "text-primary-container" : "text-outline group-hover:text-primary-container"}`} /><span className="min-w-0 flex-1 whitespace-nowrap text-sm">{link.label}</span>{link.count ? <span className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${selected ? "bg-primary-container text-white" : "bg-surface-container-high text-on-surface-variant"}`}>{link.count}</span> : <Icon name="chevron_right" className="text-[16px] text-outline" />}</Link>;
      })}</div></div>)}
    </nav>
    <div className="space-y-3 rounded-xl bg-gradient-to-br from-surface-container-low to-surface-container p-4">
      <span className="flex size-10 items-center justify-center rounded-lg bg-surface-container-lowest text-primary-container shadow-sm"><Icon name="support_agent" /></span>
      <div><h3 className="text-sm font-semibold text-on-surface">Cần trợ giúp xác minh?</h3><p className="mt-1 text-xs leading-relaxed text-on-surface-variant">Đội ngũ chuyên viên CarDB sẵn sàng hỗ trợ qua kênh bảo mật ưu tiên.</p></div>
      <a href="tel:19008899" className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-3 text-primary-container shadow-sm transition-colors hover:bg-surface-bright"><span className="flex flex-col gap-1"><span className="text-[10px] font-semibold uppercase text-on-surface-variant">Tổng đài 24/7</span><strong className="text-sm">1900 8899</strong></span><Icon name="call" className="text-[20px]" /></a>
    </div>
  </aside>;
}
