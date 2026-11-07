import { lazy } from "react";
const CarDetailPage = lazy(() => import("@/pages/vehicles/CarDetailPage.jsx"));
const ExploreCarsPage = lazy(() => import("@/pages/vehicles/ExploreCarsPage.jsx"));
const HomePage = lazy(() => import("@/pages/home/HomePage.jsx"));
const PricingPage = lazy(() => import("@/pages/pricing/PricingPage.jsx"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage.jsx"));
const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage.jsx"));
const BanksAlternativePage = lazy(() => import("@/pages/account/BanksAlternativePage.jsx"));
const PaymentSuccessPage = lazy(() => import("@/pages/payments/PaymentSuccessPage.jsx"));
const PaymentFailedPage = lazy(() => import("@/pages/payments/PaymentFailedPage.jsx"));
const HeaderShowcasePage = lazy(() => import("@/pages/information/HeaderShowcasePage.jsx"));
import { page, CarRoute } from "@/routes/elements.jsx";

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
