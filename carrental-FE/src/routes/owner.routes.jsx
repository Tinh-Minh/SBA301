import { lazy } from "react";
const OwnerCalendarPage = lazy(() => import("@/pages/vehicles/OwnerCalendarPage.jsx"));
const OwnerDashboardPage = lazy(() => import("@/pages/dashboards/OwnerDashboardPage.jsx"));
const OwnerPayoutsPage = lazy(() => import("@/pages/payouts/OwnerPayoutsPage.jsx"));
const OwnerRequestsPage = lazy(() => import("@/pages/bookings/OwnerRequestsPage.jsx"));
const OwnerTripsPage = lazy(() => import("@/pages/bookings/OwnerTripsPage.jsx"));
const OwnerVehicleEditPage = lazy(() => import("@/pages/vehicles/OwnerVehicleEditPage.jsx"));
const OwnerVehicleNewPage = lazy(() => import("@/pages/vehicles/OwnerVehicleNewPage.jsx"));
const OwnerVehiclesPage = lazy(() => import("@/pages/vehicles/OwnerVehiclesPage.jsx"));
import { page, AliasRedirect, EditCarRoute } from "@/routes/elements.jsx";
import { Outlet, useLocation } from "react-router";
import OwnerLayout from "@/components/layouts/OwnerLayout.jsx";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { useAuth } from "@/hooks/useAuth.js";
import { ownerRoutes } from "@/routes/paths.js";
import { useOwnerCounts } from "@/hooks/useVehicles.js";

const ownerNavigation = [
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
