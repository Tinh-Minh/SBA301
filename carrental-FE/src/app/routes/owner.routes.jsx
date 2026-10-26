import { lazy } from "react";
const OwnerCalendarPage = lazy(() => import("@/features/vehicles/pages/OwnerCalendarPage.jsx"));
const OwnerDashboardPage = lazy(() => import("@/features/dashboards/pages/OwnerDashboardPage.jsx"));
const OwnerPayoutsPage = lazy(() => import("@/features/payouts/pages/OwnerPayoutsPage.jsx"));
const OwnerRequestsPage = lazy(() => import("@/features/bookings/pages/OwnerRequestsPage.jsx"));
const OwnerTripsPage = lazy(() => import("@/features/bookings/pages/OwnerTripsPage.jsx"));
const OwnerVehicleEditPage = lazy(() => import("@/features/vehicles/pages/OwnerVehicleEditPage.jsx"));
const OwnerVehicleNewPage = lazy(() => import("@/features/vehicles/pages/OwnerVehicleNewPage.jsx"));
const OwnerVehiclesPage = lazy(() => import("@/features/vehicles/pages/OwnerVehiclesPage.jsx"));
import { page, AliasRedirect, EditCarRoute } from "@/app/routes/elements.jsx";
import { Outlet, useLocation } from "react-router";
import OwnerLayout from "@/shared/layouts/OwnerLayout.jsx";
import { OwnerSidebar } from "@/shared/components/owner/OwnerSidebar.jsx";
import { RequireAuth } from "@/shared/components/RequireAuth.jsx";
import { useAuth } from "@/shared/hooks/useAuth.js";
import { ownerRoutes } from "@/app/routes/paths.js";
import { useOwnerCounts } from "@/shared/hooks/useVehicles.js";

export const ownerNavigation = [
    { code: "O01", href: ownerRoutes.dashboard, label: "Tổng quan", icon: "grid_view" },
    { code: "O02", href: ownerRoutes.vehicles, label: "Xe của tôi", icon: "garage_home", badgeKey: "cars" },
    { code: "O04", href: ownerRoutes.calendar, label: "Lịch cho thuê", icon: "calendar_month" },
    { code: "O05", href: ownerRoutes.requests, label: "Yêu cầu thuê xe", icon: "pending_actions", badgeKey: "pending" },
    { code: "O06", href: ownerRoutes.trips, label: "Quản lý chuyến xe", icon: "assignment_turned_in" },
    { code: "O07", href: ownerRoutes.payouts, label: "Doanh thu & Chi trả", icon: "account_balance_wallet" },
];

function OwnerContent() {
    const { user } = useAuth();
    const path = useLocation().pathname;
    const counts = useOwnerCounts();
    return <OwnerLayout sidebar={<OwnerSidebar user={user} path={path} navigation={ownerNavigation} homeHref={ownerRoutes.dashboard} counts={counts} />}><Outlet /></OwnerLayout>;
}

export function OwnerRoute() {
    return <main data-native className="w-full bg-bg-light pt-20"><RequireAuth title="Đăng nhập để quản lý xe cho thuê"><OwnerContent /></RequireAuth></main>;
}

export const ownerPages = [
    page("owner", <AliasRedirect to="/owner/dashboard" />),
    page("owner/calendar", <OwnerCalendarPage />, "Lịch cho thuê"),
    page("owner/dashboard", <OwnerDashboardPage />, "Bảng điều khiển chủ xe"),
    page("owner/payouts", <OwnerPayoutsPage />, "Doanh thu & Chi trả"),
    page("owner/requests", <OwnerRequestsPage />, "Yêu cầu đặt xe"),
    page("owner/trips", <OwnerTripsPage />, "Quản lý chuyến xe"),
    page("owner/vehicles", <OwnerVehiclesPage />, "Xe của tôi"),
    page("owner/vehicles/new", <OwnerVehicleNewPage />, "Đăng ký xe mới"),
    page("owner/vehicles/edit/:id", <EditCarRoute Screen={OwnerVehicleEditPage} />, "Chỉnh sửa xe"),
];
