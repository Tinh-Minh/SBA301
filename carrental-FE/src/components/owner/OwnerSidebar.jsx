import { Link } from "react-router";
import { useLocation } from "react-router";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { ownerNavigation, ownerRoutes } from "@/routes/owner.routes.js";
import { useAuth } from "@/components/AuthProvider.jsx";
import { request, toPage } from "@/services/http.js";
import { Icon } from "@/components/Icon.jsx";

/** Đếm số xe (GET /api/cars/my-cars) và yêu cầu chờ duyệt (GET /api/orders/my-cars?status=PENDING). */
function useOwnerCounts() {
    const { data } = useApiQuery(["owner", "counts"], async () => {
        const [cars, pending] = await Promise.all([
            request("/api/cars/my-cars", { query: { page: 0, size: 1 } }).then(toPage).catch(() => null),
            request("/api/orders/my-cars", { query: { status: "PENDING", page: 0, size: 1 } }).then(toPage).catch(() => null),
        ]);
        return { cars: cars?.totalElements ?? null, pending: pending?.totalElements ?? null };
    });
    return data ?? { cars: null, pending: null };
}

export function OwnerSidebar() {
    const path = useLocation().pathname;
    const { user } = useAuth();
    const counts = useOwnerCounts();
    const badgeLabels = {
        cars: () => (counts.cars === null ? null : `${counts.cars} xe`),
        pending: () => (counts.pending ? `${counts.pending} mới` : null),
    };
    return <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-2 rounded-2xl border border-card-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span aria-hidden="true" className="size-2 rounded-full bg-emerald-accent shadow-[0_0_8px_rgba(16,185,129,0.5)]"/>
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-gray">Chủ xe đối tác</span>
      </div>
      <h2 className="truncate text-lg font-bold text-charcoal">{user?.fullName ?? "Chưa đăng nhập"}</h2>
      <div className="flex items-center justify-between pt-1">
        <span className="font-mono text-xs text-muted-gray">{user ? `Mã TK #${user.id}` : "—"}</span>
        <span className="whitespace-nowrap rounded-full bg-card-border/60 px-2 py-0.5 text-[11px] font-semibold text-charcoal">{counts.cars === null ? "Chủ xe" : `${counts.cars} xe niêm yết`}</span>
      </div>
    </div>

    <nav aria-label="Quản lý chủ xe" className="flex flex-col gap-1 rounded-2xl border border-card-border bg-white p-2 shadow-sm">
      {ownerNavigation.map(item => {
            const selected = item.href === ownerRoutes.dashboard ? path === item.href : path.startsWith(item.href);
            const badgeKey = "badgeKey" in item ? item.badgeKey : undefined;
            const badge = badgeKey ? badgeLabels[badgeKey]?.() : null;
            return <Link key={item.href} to={item.href} aria-current={selected ? "page" : undefined} className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm transition-all ${selected ? "bg-brand-accent font-semibold text-white shadow-sm" : "font-medium text-charcoal hover:bg-section-bg"}`}>
          <span className="flex min-w-0 items-center gap-2.5">
            <Icon name={item.icon} className={`text-[19px] ${selected ? "text-white" : "text-muted-gray"}`}/>
            <span className="whitespace-nowrap">{item.label}</span>
          </span>
          {badge ? <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-bold ${selected ? "bg-white/20 text-white" : badgeKey === "pending" ? "bg-status-amber-bg text-status-amber-dark" : "bg-badge-gray text-muted-gray"}`}>{badge}</span>
                    : selected ? <span aria-hidden="true" className="size-1.5 rounded-full bg-white"/> : null}
        </Link>;
        })}
    </nav>

    <div className="flex flex-col gap-3 rounded-2xl border border-card-border bg-white p-4 shadow-sm">
      <Link to="/explore" className="flex items-center gap-1.5 text-xs font-semibold text-muted-gray transition-colors hover:text-brand-accent">
        <Icon name="arrow_back" className="text-[16px]"/>
        <span className="whitespace-nowrap">Khám phá xe tự lái</span>
      </Link>
      <div className="flex flex-col gap-1 border-t border-card-border pt-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-gray">Hotline chủ xe 24/7</span>
        <a href="tel:19008899" className="flex items-center gap-1.5 text-sm font-bold text-brand-accent">
          <Icon name="call" className="text-[18px]"/>
          <span className="whitespace-nowrap">1900 8899 (Phím 2)</span>
        </a>
      </div>
    </div>
  </div>;
}
