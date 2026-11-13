import { lazy } from "react";
const AdminDashboardPage = lazy(() => import("@/pages/dashboards/AdminDashboardPage.jsx"));
const AdminReviewsPage = lazy(() => import("@/pages/reviews/AdminReviewsPage.jsx"));
const AdminSubscriptionsPage = lazy(() => import("@/pages/subscriptions/AdminSubscriptionsPage.jsx"));
const AdminPayoutsPage = lazy(() => import("@/pages/payouts/AdminPayoutsPage.jsx"));
const AdminUsersPage = lazy(() => import("@/pages/account/AdminUsersPage.jsx"));
const AdminVehiclesPage = lazy(() => import("@/pages/vehicles/AdminVehiclesPage.jsx"));
const AdminVouchersPage = lazy(() => import("@/pages/vouchers/AdminVouchersPage.jsx"));
const AdminPackagesPage = lazy(() => import("@/pages/pricing/AdminPackagesPage.jsx"));
const AdminBookingsPage = lazy(() => import("@/pages/admin/AdminBookingsPage.jsx"));
const AdminSafetyPage = lazy(() => import("@/pages/admin/AdminSafetyPage.jsx"));
import { page, AliasRedirect } from "@/routes/elements.jsx";
import { Outlet, useLocation } from "react-router";
import AdminLayout from "@/components/layouts/AdminLayout.jsx";
import { AdminSidebar } from "@/components/admin/AdminSidebar.jsx";
import { RequireAuth } from "@/components/RequireAuth.jsx";
import { useAuth } from "@/hooks/useAuth.js";
import { adminRoutes } from "@/routes/paths.js";
import { useApiQuery } from "@/hooks/useApiQuery.js";
import { getAdminBadges } from "@/services/adminService.js";

const adminNavigation = [
    { code: "A01", href: adminRoutes.dashboard, label: "Tổng quan", icon: "grid_view" },
    { code: "A02", href: adminRoutes.users, label: "Người dùng & KYC", icon: "verified_user", badgeKey: "kyc", badgeSuffix: "chờ", badgeTone: "warning" },
    { code: "A03", href: adminRoutes.vehicles, label: "Duyệt xe", icon: "directions_car", badgeKey: "cars", badgeSuffix: "xe", badgeTone: "warning" },
    { code: "A09", href: "/admin/bookings", label: "Đơn thuê xe", icon: "assignment" },
    { code: "A10", href: "/admin/safety", label: "Hồ sơ an toàn xe", icon: "shield" },
    { code: "A04", href: adminRoutes.vouchers, label: "Voucher", icon: "confirmation_number" },
    { code: "A05", href: adminRoutes.subscriptions, label: "Quản lý Đăng tin", icon: "workspace_premium" },
    { code: "A08", href: adminRoutes.packages, label: "Cấu hình Gói cước", icon: "sell" },
    { code: "A06", href: adminRoutes.payouts, label: "Giao dịch gói", icon: "payments", badgeKey: "payouts", badgeSuffix: "chờ", badgeTone: "info" },
    { code: "A07", href: "/admin/reviews", label: "Đánh giá xe", icon: "reviews" },
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
    page("admin/disputes", <AliasRedirect to="/admin/bookings" />),
    page("admin/reviews", <AdminReviewsPage />, "Đánh giá xe"),
    page("admin/orders", <AliasRedirect to="/admin/bookings" />),
    page("admin/bookings", <AdminBookingsPage />, "Đơn thuê xe"),
    page("admin/safety", <AdminSafetyPage />, "Hồ sơ an toàn xe"),
    page("admin/subscriptions", <AdminSubscriptionsPage />, "Gói đăng tin toàn hệ thống"),
    page("admin/payouts", <AdminPayoutsPage />, "Giao dịch & Chi trả"),
    page("admin/users", <AdminUsersPage />, "Người dùng & KYC"),
    page("admin/vehicles", <AdminVehiclesPage />, "Duyệt xe"),
    page("admin/vouchers", <AdminVouchersPage />, "Voucher & Khuyến mãi"),
    page("admin/packages", <AdminPackagesPage />, "Gói đăng tin"),
];
