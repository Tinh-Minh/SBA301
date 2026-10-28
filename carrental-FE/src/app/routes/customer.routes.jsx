import { lazy } from "react";
const BanksPage = lazy(() => import("@/pages/account/BanksPage.jsx"));
const DriverProfilePage = lazy(() => import("@/pages/account/DriverProfilePage.jsx"));
const MyRentalsPage = lazy(() => import("@/pages/bookings/MyRentalsPage.jsx"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage.jsx"));
const VerificationPage = lazy(() => import("@/pages/account/VerificationPage.jsx"));
const CheckoutPage = lazy(() => import("@/pages/bookings/CheckoutPage.jsx"));
const DisputePage = lazy(() => import("@/pages/disputes/DisputePage.jsx"));
const OrderDetailPage = lazy(() => import("@/pages/bookings/OrderDetailPage.jsx").then(module => ({ default: module.OrderDetailPage })));
const PaymentPage = lazy(() => import("@/pages/payments/PaymentPage.jsx"));
const OwnerReviewPage = lazy(() => import("@/pages/reviews/OwnerReviewPage.jsx"));
import { page, AliasRedirect, OrderRoute } from "@/app/routes/elements.jsx";

export const customerPages = [
    page("account", <ProfilePage />),
    page("account/bank", <BanksPage />),
    page("account/driver", <DriverProfilePage />),
    page("account/verification", <VerificationPage />),
    page("account/orders", <MyRentalsPage mode="all" />),
    page("account/history", <MyRentalsPage mode="history" />),
    page("my-trips", <MyRentalsPage mode="active" />),
    page("booking/confirm", <CheckoutPage />),
    page("orders/:id", <OrderRoute Screen={OrderDetailPage} />, "Chi tiết đơn thuê"),
    page("payment", <PaymentPage />),
    page("reviews", <OwnerReviewPage />),
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
