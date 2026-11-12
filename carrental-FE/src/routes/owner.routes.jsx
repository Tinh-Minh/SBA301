import { lazy } from "react";
const OwnerCalendarPage = lazy(() => import("@/pages/vehicles/OwnerCalendarPage.jsx"));
const OwnerDashboardPage = lazy(() => import("@/pages/dashboards/OwnerDashboardPage.jsx"));
const OwnerPayoutsPage = lazy(() => import("@/pages/payouts/OwnerPayoutsPage.jsx"));
const BuySubscriptionPage = lazy(() => import("@/pages/subscriptions/BuySubscriptionPage.jsx"));
const MySubscriptionsPage = lazy(() => import("@/pages/subscriptions/MySubscriptionsPage.jsx"));
const SubscriptionDetailPage = lazy(() => import("@/pages/subscriptions/SubscriptionDetailPage.jsx"));
const OwnerVehicleEditPage = lazy(() => import("@/pages/vehicles/OwnerVehicleEditPage.jsx"));
const OwnerVehicleNewPage = lazy(() => import("@/pages/vehicles/OwnerVehicleNewPage.jsx"));
const OwnerVehiclesPage = lazy(() => import("@/pages/vehicles/OwnerVehiclesPage.jsx"));
const OwnerBookingsPage = lazy(() => import("@/pages/owner/OwnerBookingsPage.jsx"));
const OwnerCarOverviewPage = lazy(() => import("@/pages/owner/OwnerCarOverviewPage.jsx"));
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
    { code: "O03", href: "/owner/bookings", label: "Đơn thuê xe", icon: "assignment" },
    { code: "O02", href: ownerRoutes.vehicles, label: "Xe của tôi", icon: "garage_home", badgeKey: "cars" },
    { code: "O04", href: ownerRoutes.calendar, label: "Lịch hiển thị", icon: "calendar_month" },
    { code: "O05", href: ownerRoutes.subscriptions, label: "Gói đăng tin", icon: "workspace_premium" },
    { code: "O07", href: ownerRoutes.payouts, label: "Giao dịch gói", icon: "account_balance_wallet" },
];

function OwnerContent() {
    const { user } = useAuth();
    const path = useLocation().pathname;
    const counts = useOwnerCounts();
    return <OwnerLayout sidebar={<OwnerSidebar user={user} path={path} navigation={ownerNavigation} homeHref={ownerRoutes.dashboard} counts={counts} />}><Outlet /></OwnerLayout>;
}

export function OwnerRoute() {
    return <main data-native className="w-full bg-bg-light pt-20"><RequireAuth owner title="Đăng nhập để quản lý xe cho thuê"><OwnerContent /></RequireAuth></main>;
}

export const ownerPages = [
    page("owner", <AliasRedirect to="/owner/dashboard" />),
    page("owner/calendar", <OwnerCalendarPage />, "Lịch hiển thị tin"),
    page("owner/dashboard", <OwnerDashboardPage />, "Bảng điều khiển chủ xe"),
    page("owner/payouts", <OwnerPayoutsPage />, "Giao dịch gói đăng tin"),
    page("owner/bookings", <OwnerBookingsPage />, "Đơn thuê xe"),
    page("owner/vehicles/:id/overview", <OwnerCarOverviewPage />, "Theo dõi xe"),
    page("owner/requests", <AliasRedirect to="/owner/bookings" />),
    page("owner/trips", <AliasRedirect to="/owner/bookings" />),
    page("owner/subscriptions", <MySubscriptionsPage />, "Gói đăng tin"),
    page("owner/subscriptions/new", <BuySubscriptionPage />, "Mua gói đăng tin"),
    page("owner/subscriptions/:id", <SubscriptionDetailPage />, "Chi tiết gói đăng tin"),
    page("owner/vehicles", <OwnerVehiclesPage />, "Xe của tôi"),
    page("owner/vehicles/new", <OwnerVehicleNewPage />, "Đăng ký xe mới"),
    page("owner/vehicles/edit/:id", <EditCarRoute Screen={OwnerVehicleEditPage} />, "Chỉnh sửa xe"),
];
