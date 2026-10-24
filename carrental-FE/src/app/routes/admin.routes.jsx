import { lazy } from "react";
const AdminDashboardPage = lazy(() => import("@/features/dashboards/pages/AdminDashboardPage.jsx"));
const AdminDisputesPage = lazy(() => import("@/features/disputes/pages/AdminDisputesPage.jsx"));
const AdminOrdersPage = lazy(() => import("@/features/bookings/pages/AdminOrdersPage.jsx"));
const AdminPayoutsPage = lazy(() => import("@/features/payouts/pages/AdminPayoutsPage.jsx"));
const AdminUsersPage = lazy(() => import("@/features/account/pages/AdminUsersPage.jsx"));
const AdminVehiclesPage = lazy(() => import("@/features/vehicles/pages/AdminVehiclesPage.jsx"));
const AdminVouchersPage = lazy(() => import("@/features/vouchers/pages/AdminVouchersPage.jsx"));
import { page, AliasRedirect } from "@/app/routes/elements.jsx";
import { Outlet, useLocation } from "react-router";
import AdminLayout from "@/shared/layouts/AdminLayout.jsx";
import { AdminSidebar } from "@/shared/components/admin/AdminSidebar.jsx";
import { RequireAuth } from "@/shared/components/RequireAuth.jsx";
import { useAuth } from "@/shared/hooks/useAuth.js";
import { adminRoutes } from "@/app/routes/paths.js";
import { useApiQuery } from "@/shared/hooks/useApiQuery.js";
import { getAdminBadges } from "@/shared/hooks/useAdmin.js";

export const adminNavigation = [
    { code: "A01", href: adminRoutes.dashboard, label: "Tổng quan", icon: "grid_view" },
    { code: "A02", href: adminRoutes.users, label: "Người dùng & KYC", icon: "verified_user", badgeKey: "kyc", badgeSuffix: "chờ", badgeTone: "warning" },
    { code: "A03", href: adminRoutes.vehicles, label: "Duyệt xe", icon: "directions_car", badgeKey: "cars", badgeSuffix: "xe", badgeTone: "warning" },
    { code: "A04", href: adminRoutes.vouchers, label: "Voucher", icon: "confirmation_number" },
    { code: "A05", href: adminRoutes.orders, label: "Đơn thuê", icon: "receipt_long" },
    { code: "A06", href: adminRoutes.payouts, label: "Giao dịch & Chi trả", icon: "payments", badgeKey: "payouts", badgeSuffix: "chờ", badgeTone: "info" },
    { code: "A07", href: adminRoutes.disputes, label: "Tranh chấp", icon: "gavel", badgeKey: "disputes", badgeSuffix: "hồ sơ", badgeTone: "danger" },
];

function AdminContent() {
    const { user } = useAuth();
    const path = useLocation().pathname;
    const { data: badges = {} } = useApiQuery(["admin", "badges"], getAdminBadges);
    return <AdminLayout sidebar={<AdminSidebar user={user} path={path} navigation={adminNavigation} homeHref={adminRoutes.dashboard} badges={badges} />}><Outlet /></AdminLayout>;
}

export function AdminRoute() {
    return <main data-native className="w-full bg-[#F7F7F5] pt-20"><RequireAuth admin title="Đăng nhập tài khoản quản trị"><AdminContent /></RequireAuth></main>;
}

export const adminPages = [
    page("admin", <AliasRedirect to="/admin/dashboard" />),
    page("admin/dashboard", <AdminDashboardPage />, "Tổng quan quản trị"),
    page("admin/disputes", <AdminDisputesPage />, "Tranh chấp & Khiếu nại"),
    page("admin/orders", <AdminOrdersPage />, "Đơn thuê toàn hệ thống"),
    page("admin/payouts", <AdminPayoutsPage />, "Giao dịch & Chi trả"),
    page("admin/users", <AdminUsersPage />, "Người dùng & KYC"),
    page("admin/vehicles", <AdminVehiclesPage />, "Duyệt xe"),
    page("admin/vouchers", <AdminVouchersPage />, "Voucher & Khuyến mãi"),
];
