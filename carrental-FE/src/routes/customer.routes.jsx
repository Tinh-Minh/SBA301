import { lazy } from "react";
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage.jsx"));
const VerificationPage = lazy(() => import("@/pages/account/VerificationPage.jsx"));
const PaymentPage = lazy(() => import("@/pages/payments/PaymentPage.jsx"));
const MyReviewsPage = lazy(() => import("@/pages/reviews/MyReviewsPage.jsx"));
const MyTripsPage = lazy(() => import("@/pages/trips/MyTripsPage.jsx"));
const TripDetailPage = lazy(() => import("@/pages/trips/TripDetailPage.jsx"));
import { page, AliasRedirect } from "@/routes/elements.jsx";

export const customerPages = [
    page("account", <ProfilePage />),
    page("trips", <MyTripsPage />, "Chuyến đi của tôi"),
    page("trips/:id", <TripDetailPage />, "Chi tiết đơn thuê"),
    page("account/bank", <AliasRedirect to="/account" />),
    page("account/verification", <VerificationPage />),
    page("account/orders", <AliasRedirect to="/trips" />),
    page("account/history", <AliasRedirect to="/trips" />),
    page("my-reviews", <MyReviewsPage />, "Đánh giá của tôi"),
    page("my-trips", <AliasRedirect to="/trips" />),
    page("booking/confirm", <AliasRedirect to="/explore" />),
    page("orders/:id", <AliasRedirect to="/trips" />),
    page("payment", <PaymentPage />),
    page("reviews", <MyReviewsPage />, "Đánh giá của tôi"),
    page("disputes", <AliasRedirect to="/trips" />),
    page("account/bank/add", <AliasRedirect to="/account" />),
    page("account/bank/default", <AliasRedirect to="/account" />),
    page("account/verification/compact", <AliasRedirect to="/account/verification" />),
    page("booking/success", <AliasRedirect to="/owner/subscriptions" />),
    page("handover/pickup", <AliasRedirect to="/owner/subscriptions" />),
    page("handover/return", <AliasRedirect to="/owner/subscriptions" />),
    page("orders/CDB-ORD-20261026-904", <AliasRedirect to="/owner/subscriptions" />),
    page("orders/CDB-ORD-20261026-904/confirmed", <AliasRedirect to="/owner/subscriptions" />),
];
