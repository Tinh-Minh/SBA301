import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { initials, resolveAssetUrl } from "@/utils/labels.js";

export function OwnerSidebar({ user, path, navigation, homeHref, counts }) {
    const badgeLabels = {
        cars: () => (counts.cars === null ? null : `${counts.cars} xe`),
        pending: () => (counts.pending ? `${counts.pending} mới` : null),
    };
    const avatarSrc = resolveAssetUrl(user?.avatarUrl);
    return <div className="flex flex-col gap-4">
    <div className="relative overflow-hidden rounded-2xl border border-[#383830] bg-[#25251F] p-5 text-[#FAF8F2] shadow-md">
      <div className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full bg-[#FC6C26]/20 blur-2xl"/>
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {avatarSrc ? (
            <img src={avatarSrc} alt={user?.fullName || "Avatar"} className="size-12 shrink-0 rounded-2xl border border-white/20 object-cover shadow-sm"/>
          ) : (
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FC6C26] text-sm font-extrabold text-white shadow-sm">{initials(user?.fullName)}</span>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]"/>
              <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#B5B2A6]">Kênh Chủ xe Đối tác</span>
            </div>
            <h2 className="mt-0.5 truncate text-base font-extrabold text-[#FAF8F2]">{user?.fullName ?? "Chưa đăng nhập"}</h2>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-white/10 pt-2.5">
          <span className="font-mono text-xs text-[#C7C4B8]">{user ? `Mã TK #${user.id}` : "—"}</span>
          <span className="whitespace-nowrap rounded-full bg-[#FC6C26] px-2.5 py-0.5 text-[11px] font-bold text-white">{counts.cars === null ? "Chủ xe" : `${counts.cars} xe`}</span>
        </div>
      </div>
    </div>

    <nav aria-label="Quản lý chủ xe" className="flex flex-col gap-1 rounded-2xl border border-[#E4E2D8] bg-white p-2.5 shadow-sm">
      {navigation.map(item => {
            const selected = item.href === homeHref ? path === item.href : path.startsWith(item.href);
            const badgeKey = "badgeKey" in item ? item.badgeKey : undefined;
            const badge = badgeKey ? badgeLabels[badgeKey]?.() : null;
            return <Link key={item.href} to={item.href} aria-current={selected ? "page" : undefined} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-all ${selected ? "bg-[#25251F] font-bold text-[#FAF8F2] shadow-sm" : "font-medium text-[#25251F] hover:bg-[#F3F1EA]"}`}>
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name={item.icon} className={`text-[19px] ${selected ? "text-[#FC6C26]" : "text-[#6C6C61]"}`}/>
            <span className="whitespace-nowrap">{item.label}</span>
          </span>
          {badge ? <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? "bg-[#FC6C26] text-white" : badgeKey === "pending" ? "bg-status-amber-bg text-status-amber-dark" : "bg-[#EAE8E0] text-[#5C584F]"}`}>{badge}</span>
                    : selected ? <span aria-hidden="true" className="size-1.5 rounded-full bg-[#FC6C26]"/> : null}
        </Link>;
        })}
    </nav>

    <div className="flex flex-col gap-3 rounded-2xl border border-[#DEDAD0] bg-[#EAE6DC] p-4">
      <Link to="/explore" className="flex items-center gap-1.5 text-xs font-bold text-[#25251F] transition-colors hover:text-[#FC6C26]">
        <Icon name="arrow_back" className="text-[16px] text-[#FC6C26]"/>
        <span className="whitespace-nowrap">Khám phá xe tự lái</span>
      </Link>
      <div className="flex flex-col gap-1 border-t border-[#D6D3CB] pt-2.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C6C61]">Hotline chủ xe 24/7</span>
        <a href="tel:19008899" className="flex items-center gap-1.5 text-sm font-extrabold text-[#FC6C26]">
          <Icon name="call" className="text-[18px]"/>
          <span className="whitespace-nowrap">1900 8899 (Phím 2)</span>
        </a>
      </div>
    </div>
  </div>;
}
