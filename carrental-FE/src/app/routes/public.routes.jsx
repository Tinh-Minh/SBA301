import { lazy } from "react";
const CarDetailPage = lazy(() => import("@/features/vehicles/pages/CarDetailPage.jsx"));
const ExploreCarsPage = lazy(() => import("@/features/vehicles/pages/ExploreCarsPage.jsx"));
const HomePage = lazy(() => import("@/features/home/pages/HomePage.jsx"));
const PricingPage = lazy(() => import("@/features/pricing/pages/PricingPage.jsx"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage.jsx"));
const BanksAlternativePage = lazy(() => import("@/features/account/pages/BanksAlternativePage.jsx"));
const PaymentSuccessPage = lazy(() => import("@/features/payments/pages/PaymentSuccessPage.jsx"));
const PaymentFailedPage = lazy(() => import("@/features/payments/pages/PaymentFailedPage.jsx"));
const HeaderShowcasePage = lazy(() => import("@/features/information/pages/HeaderShowcasePage.jsx"));
import { page, CarRoute } from "@/app/routes/elements.jsx";

export const publicPages = [
    page("", <HomePage />),
    page("pricing", <PricingPage />),
    page("login", <LoginPage />),
    page("register", <RegisterPage />),
    page("design/banks", <BanksAlternativePage />),
    page("payment/success", <PaymentSuccessPage />),
    page("payment/failed", <PaymentFailedPage />),
    page("components/navigation", <HeaderShowcasePage />),
    page("cars/:id", <CarRoute Screen={CarDetailPage} />, "Chi tiết xe"),
    page("explore", <ExploreCarsPage />),
];
