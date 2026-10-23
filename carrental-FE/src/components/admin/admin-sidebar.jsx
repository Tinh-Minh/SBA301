"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { adminNavigation, adminRoutes } from "@/lib/admin/routes";
import { useAuth } from "@/components/auth-provider";
import { getAdminBadges } from "@/services/admin.service";
import { Icon } from "../icon";

const badgeClass = {
    warning: "bg-[#FEF3C7] text-[#B45309]",
    danger: "bg-[#FEE2E2] text-[#B91C1C]",
    info: "bg-blue-50 text-blue-800",
};

export function AdminSidebar() {
    const path = usePathname();
    const { user } = useAuth();
    const [badges, setBadges] = useState({});
    useEffect(() => {
        let cancelled = false;
        getAdminBadges().then(result => { if (!cancelled) setBadges(result); });
        return () => { cancelled = true; };
    }, [path]);
    return <div className="flex flex-col gap-4">
    <div className="rounded-2xl border border-[#E9E9E7] bg-white p-5 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wider text-[#666666]">CarDB Admin</p>
      <h2 className="mt-1 truncate text-lg font-bold text-[#292929]">{user?.fullName ?? "Quản trị viên"}</h2>
      <p className="mt-1 whitespace-nowrap text-xs text-[#666666]">Quản trị viên • #{user?.id ?? "—"}</p>
    </div>
    <nav aria-label="Quản trị hệ thống" className="flex flex-col gap-1 rounded-2xl border border-[#E9E9E7] bg-white p-2 shadow-sm">
      {adminNavigation.map(item => {
            const selected = item.href === adminRoutes.dashboard ? path === item.href : path.startsWith(item.href);
            const count = item.badgeKey ? badges[item.badgeKey] : 0;
            return <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined} className={`flex items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-all ${selected ? "bg-[#FC6C26] font-semibold text-white shadow-sm" : "font-medium text-[#292929] hover:bg-[#F7F7F5]"}`}>
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name={item.icon} className={`text-[19px] ${selected ? "text-white" : "text-[#666666]"}`}/>
            <span className="whitespace-nowrap">{item.label}</span>
          </span>
          {count ? <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? "bg-white/20 text-white" : badgeClass[item.badgeTone]}`}>{count} {item.badgeSuffix}</span> : null}
        </Link>;
        })}
    </nav>
  </div>;
}
