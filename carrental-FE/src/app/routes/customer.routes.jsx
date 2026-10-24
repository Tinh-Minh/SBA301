import { lazy } from "react";
const BanksPage = lazy(() => import("@/features/account/pages/BanksPage.jsx"));
const DriverProfilePage = lazy(() => import("@/features/account/pages/DriverProfilePage.jsx"));
const MyRentalsPage = lazy(() => import("@/features/bookings/pages/MyRentalsPage.jsx"));
const ProfilePage = lazy(() => import("@/features/account/pages/ProfilePage.jsx"));
const VerificationPage = lazy(() => import("@/features/account/pages/VerificationPage.jsx"));
const CheckoutPage = lazy(() => import("@/features/bookings/pages/CheckoutPage.jsx"));
const DisputePage = lazy(() => import("@/features/disputes/pages/DisputePage.jsx"));
const OrderDetailPage = lazy(() => import("@/features/bookings/pages/OrderDetailPage.jsx").then(module => ({ default: module.OrderDetailPage })));
const PaymentPage = lazy(() => import("@/features/payments/pages/PaymentPage.jsx"));
const ReviewPage = lazy(() => import("@/features/reviews/pages/ReviewPage.jsx"));
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
