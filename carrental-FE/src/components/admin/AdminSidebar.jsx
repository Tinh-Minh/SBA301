import { Link } from "react-router";
import { Icon } from "@/components/Icon.jsx";

const badgeClass = {
    warning: "bg-[#FEF3C7] text-[#B45309]",
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    info: "bg-blue-50 text-blue-800",
};

// Gom mục điều hướng theo nhóm, giữ thứ tự nhóm xuất hiện lần đầu.
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
    return <div className="flex flex-col gap-4">
    <div className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">CarDB Admin</p>
      <h2 className="mt-1 break-words text-lg font-bold leading-snug text-[#292929]">{user?.fullName ?? "Quản trị viên"}</h2>
      <p className="mt-1 whitespace-nowrap text-xs text-[#666666]">Quản trị viên • #{user?.id ?? "—"}</p>
    </div>
    <nav aria-label="Quản trị hệ thống" className="flex flex-col gap-1 rounded-2xl border border-[#E9E9E7] bg-white p-2 shadow-sm">
      {groupNavigation(navigation).flatMap(([group, items]) => [
        group ? <p key={"g-" + group} className="nav-group-label">{group}</p> : null,
        ...items.map(item => {
            const selected = item.href === homeHref ? path === item.href : path.startsWith(item.href);
            const count = item.badgeKey ? badges[item.badgeKey] : 0;
            const selectedClass = selected ? item.href === "/admin/packages" ? "bg-[#B9430C] font-semibold text-white shadow-sm" : "bg-[#FC6C26] font-semibold text-white shadow-sm" : "font-medium text-[#292929] hover:bg-[#F7F7F5]";
            return <Link key={item.href} to={item.href} aria-current={selected ? "page" : undefined} className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-all ${selectedClass}`}>
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name={item.icon} className={`text-[19px] ${selected ? "text-white" : "text-[#666666]"}`}/>
            <span className="whitespace-nowrap">{item.label}</span>
          </span>
          {count ? <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? "bg-white/20 text-white" : badgeClass[item.badgeTone]}`}>{count} {item.badgeSuffix}</span> : null}
        </Link>;
        })])}
    </nav>
  </div>;
}
