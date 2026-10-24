import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider, Navigate, useLocation, useParams } from "react-router";
import MainLayout from "@/shared/layouts/CustomerLayout.jsx";
import AdminLayout from "@/shared/layouts/AdminLayout.jsx";
import OwnerLayout from "@/shared/layouts/OwnerLayout.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import { InformationPage } from "@/shared/components/InformationPage.jsx";
import { pageTitles } from "@/app/routes/routes.constants.js";
import { routeAliases } from "@/app/routes/route-aliases.js";
const BanksPage = lazy(() => import("@/pages/user/BanksPage.jsx"));
const DriverProfilePage = lazy(() => import("@/pages/user/DriverProfilePage.jsx"));
const MyRentalsPage = lazy(() => import("@/pages/user/MyRentalsPage.jsx"));
const ProfilePage = lazy(() => import("@/pages/user/ProfilePage.jsx"));
const VerificationPage = lazy(() => import("@/pages/user/VerificationPage.jsx"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/AdminDashboardPage.jsx"));
const AdminDisputesPage = lazy(() => import("@/pages/admin/AdminDisputesPage.jsx"));
const AdminOrdersPage = lazy(() => import("@/pages/admin/AdminOrdersPage.jsx"));
const AdminPayoutsPage = lazy(() => import("@/pages/admin/AdminPayoutsPage.jsx"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage.jsx"));
const AdminVehiclesPage = lazy(() => import("@/pages/admin/AdminVehiclesPage.jsx"));
const AdminVouchersPage = lazy(() => import("@/pages/admin/AdminVouchersPage.jsx"));
const CheckoutPage = lazy(() => import("@/pages/user/CheckoutPage.jsx"));
const CarDetailPage = lazy(() => import("@/pages/user/CarDetailPage.jsx"));
const DisputePage = lazy(() => import("@/pages/user/DisputePage.jsx"));
const ExploreCarsPage = lazy(() => import("@/pages/user/ExploreCarsPage.jsx"));
const OrderDetailPage = lazy(() => import("@/pages/user/OrderDetailPage.jsx").then(module => ({ default: module.OrderDetailPage })));
const OwnerCalendarPage = lazy(() => import("@/pages/owner/OwnerCalendarPage.jsx"));
const OwnerDashboardPage = lazy(() => import("@/pages/owner/OwnerDashboardPage.jsx"));
const OwnerPayoutsPage = lazy(() => import("@/pages/owner/OwnerPayoutsPage.jsx"));
const OwnerRequestsPage = lazy(() => import("@/pages/owner/OwnerRequestsPage.jsx"));
const OwnerTripsPage = lazy(() => import("@/pages/owner/OwnerTripsPage.jsx"));
const OwnerVehicleEditPage = lazy(() => import("@/pages/owner/OwnerVehicleEditPage.jsx"));
const OwnerVehicleNewPage = lazy(() => import("@/pages/owner/OwnerVehicleNewPage.jsx"));
const OwnerVehiclesPage = lazy(() => import("@/pages/owner/OwnerVehiclesPage.jsx"));
const PaymentPage = lazy(() => import("@/pages/user/PaymentPage.jsx"));
const ReviewPage = lazy(() => import("@/pages/user/ReviewPage.jsx"));
const HomePage = lazy(() => import("@/pages/user/HomePage.jsx"));
const PricingPage = lazy(() => import("@/pages/user/PricingPage.jsx"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage.jsx"));
const BanksAlternativePage = lazy(() => import("@/pages/user/BanksAlternativePage.jsx"));
const PaymentSuccessPage = lazy(() => import("@/pages/user/PaymentSuccessPage.jsx"));
const PaymentFailedPage = lazy(() => import("@/pages/user/PaymentFailedPage.jsx"));
const HeaderShowcasePage = lazy(() => import("@/pages/HeaderShowcasePage.jsx"));
function PendingPage() {
    return <p role="status" className="px-6 pt-28 text-sm text-text-secondary">Đang tải trang…</p>;
}
function AliasRedirect({ to }) {
    const location = useLocation();
    const params = useParams();
    const pathname = to.replace(":path*", params["*"] || "").replace(":id", params.id || "");
    return <Navigate replace to={pathname + location.search + location.hash} />;
}
function CarRoute({ Screen }) {
    const { id } = useParams();
    return /^\d+$/.test(id) ? <Screen carId={id} /> : <Navigate replace to="/explore" />;
}
function EditCarRoute({ Screen }) {
    const { id } = useParams();
    const carId = Number(id);
    return Number.isSafeInteger(carId) && carId > 0 ? <Screen carId={carId} /> : <NotFoundPage />;
}
function OrderRoute({ Screen }) {
    const { id } = useParams();
    return <Screen orderId={id} />;
}

function page(path, element, title = pageTitles[path]) {
    return {
        path,
        element: <Suspense fallback={<PendingPage />}>{element}</Suspense>,
        handle: { title },
    };
}

const publicPages = [
    page("", <HomePage />),
    page("pricing", <PricingPage />),
    page("login", <LoginPage />),
    page("register", <RegisterPage />),
    page("design/banks", <BanksAlternativePage />),
    page("payment/success", <PaymentSuccessPage />),
    page("payment/failed", <PaymentFailedPage />),
    page("components/navigation", <HeaderShowcasePage />),
    page("account", <ProfilePage />),
    page("account/bank", <BanksPage />),
    page("account/driver", <DriverProfilePage />),
    page("account/verification", <VerificationPage />),
    page("account/orders", <MyRentalsPage mode="all" />),
    page("account/history", <MyRentalsPage mode="history" />),
    page("my-trips", <MyRentalsPage mode="active" />),
    page("booking/confirm", <CheckoutPage />),
    page("cars/:id", <CarRoute Screen={CarDetailPage} />, "Chi tiết xe"),
    page("orders/:id", <OrderRoute Screen={OrderDetailPage} />, "Chi tiết đơn thuê"),
    page("explore", <ExploreCarsPage />),
    page("payment", <PaymentPage />),
    page("reviews", <ReviewPage />),
    page("disputes", <DisputePage />),
    page("account/bank/add", <AliasRedirect to="/account/bank" />),
    page("account/bank/default", <AliasRedirect to="/account/bank" />),
    page("account/verification/compact", <AliasRedirect to="/account/verification" />),
    page("booking/success", <AliasRedirect to="/my-trips" />),
    page("handover/pickup", <AliasRedirect to="/my-trips" />),
    page("handover/return", <AliasRedirect to="/my-trips" />),
    page("orders/CDB-ORD-20261026-904", <AliasRedirect to="/my-trips" />),
    page("orders/CDB-ORD-20261026-904/confirmed", <AliasRedirect to="/my-trips" />),
];

const adminPages = [
    page("admin", <AliasRedirect to="/admin/dashboard" />),
    page("admin/dashboard", <AdminDashboardPage />, "Tổng quan quản trị"),
    page("admin/disputes", <AdminDisputesPage />, "Tranh chấp & Khiếu nại"),
    page("admin/orders", <AdminOrdersPage />, "Đơn thuê toàn hệ thống"),
    page("admin/payouts", <AdminPayoutsPage />, "Giao dịch & Chi trả"),
    page("admin/users", <AdminUsersPage />, "Người dùng & KYC"),
    page("admin/vehicles", <AdminVehiclesPage />, "Duyệt xe"),
    page("admin/vouchers", <AdminVouchersPage />, "Voucher & Khuyến mãi"),
];

const ownerPages = [
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

const knownPaths = new Set([...publicPages, ...adminPages, ...ownerPages].map(route => route.path));
const router = createBrowserRouter([{ element: <MainLayout />, children: [
    ...publicPages,
    { element: <AdminLayout />, children: adminPages },
    { element: <OwnerLayout />, children: ownerPages },
    ...Object.entries(routeAliases).filter(([path]) => !knownPaths.has(path.slice(1))).map(([path, to]) => ({
        path: path.slice(1).replace(":path*", "*"), element: <AliasRedirect to={to} />,
    })),
    ...Object.entries(pageTitles).filter(([path]) => !knownPaths.has(path) && !path.startsWith("cars/") && !path.startsWith("orders/")).map(([path, title]) => ({
        path, element: <InformationPage slug={path} title={title} />, handle: { title },
    })),
    { path: "*", element: <NotFoundPage />, handle: { title: "Không tìm thấy trang" } },
] }]);

export default function AppRoutes() { return <RouterProvider router={router} />; }
