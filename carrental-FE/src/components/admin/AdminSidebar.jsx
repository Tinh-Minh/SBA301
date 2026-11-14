import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";
import { initials, resolveAssetUrl } from "@/utils/labels.js";

const badgeClass = {
    warning: "bg-[#FEF3C7] text-[#B45309]",
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    info: "bg-blue-50 text-blue-800",
};

function groupNavigation(navigation) {
    const groups = new Map();
    for (const item of navigation) {
        const key = item.group ?? "";
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key).push(item);
    }
    return [...groups.entries()];
}

export function AdminSidebar({ user, path, navigation, homeHref, badges }) {
    const avatarSrc = resolveAssetUrl(user?.avatarUrl);
    return <div className="flex flex-col gap-4">
    <div className="relative overflow-hidden rounded-2xl border border-[#383830] bg-[#25251F] p-5 text-[#FAF8F2] shadow-md">
      <div className="pointer-events-none absolute -top-6 -right-6 size-24 rounded-full bg-[#FC6C26]/25 blur-2xl"/>
      <div className="relative flex items-center gap-3">
        {avatarSrc ? (
          <img src={avatarSrc} alt={user?.fullName || "Avatar"} className="size-12 shrink-0 rounded-2xl border border-white/20 object-cover shadow-sm"/>
        ) : (
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#FC6C26] text-sm font-extrabold text-white shadow-sm">{initials(user?.fullName)}</span>
        )}
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest text-[#FC6C26]">
            <span className="size-1.5 rounded-full bg-[#FC6C26]"/>CarDB Admin Console
          </span>
          <h2 className="mt-0.5 break-words text-base font-extrabold leading-snug text-[#FAF8F2]">{user?.fullName ?? "Quản trị viên"}</h2>
          <p className="mt-0.5 whitespace-nowrap font-mono text-xs text-[#C7C4B8]">Quản trị viên • #{user?.id ?? "—"}</p>
        </div>
      </div>
    </div>
    <nav aria-label="Quản trị hệ thống" className="flex flex-col gap-1 rounded-2xl border border-[#E4E2D8] bg-white p-2.5 shadow-sm">
      {groupNavigation(navigation).flatMap(([group, items]) => [
        group ? <p key={"g-" + group} className="nav-group-label">{group}</p> : null,
        ...items.map(item => {
            const selected = item.href === homeHref ? path === item.href : path.startsWith(item.href);
            const count = item.badgeKey ? badges[item.badgeKey] : 0;
            return <Link key={item.href} to={item.href} aria-current={selected ? "page" : undefined} className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-all ${selected ? "bg-[#25251F] font-bold text-[#FAF8F2] shadow-sm" : "font-medium text-[#25251F] hover:bg-[#F3F1EA]"}`}>
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name={item.icon} className={`text-[19px] ${selected ? "text-[#FC6C26]" : "text-[#6C6C61]"}`}/>
            <span className="whitespace-nowrap">{item.label}</span>
          </span>
          {count ? <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? "bg-[#FC6C26] text-white" : badgeClass[item.badgeTone]}`}>{count} {item.badgeSuffix}</span> : null}
        </Link>;
        })])}
    </nav>
  </div>;
}
