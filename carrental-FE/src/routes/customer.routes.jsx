import { lazy } from "react";
const BanksPage = lazy(() => import("@/pages/account/BanksPage.jsx"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage.jsx"));
const VerificationPage = lazy(() => import("@/pages/account/VerificationPage.jsx"));
const PaymentPage = lazy(() => import("@/pages/payments/PaymentPage.jsx"));
const MyReviewsPage = lazy(() => import("@/pages/reviews/MyReviewsPage.jsx"));
import { page, AliasRedirect } from "@/routes/elements.jsx";

export const customerPages = [
    page("account", <ProfilePage />),
    page("account/bank", <BanksPage />),
    page("account/verification", <VerificationPage />),
    page("account/orders", <AliasRedirect to="/my-trips" />),
    page("account/history", <AliasRedirect to="/my-trips" />),
    page("my-trips", <MyReviewsPage />, "Đánh giá của tôi"),
    page("booking/confirm", <AliasRedirect to="/explore" />),
    page("orders/:id", <AliasRedirect to="/my-trips" />),
    page("payment", <PaymentPage />),
    page("reviews", <MyReviewsPage />, "Đánh giá của tôi"),
    page("disputes", <AliasRedirect to="/my-trips" />),
    page("account/bank/add", <AliasRedirect to="/account/bank" />),
    page("account/bank/default", <AliasRedirect to="/account/bank" />),
    page("account/verification/compact", <AliasRedirect to="/account/verification" />),
    page("booking/success", <AliasRedirect to="/owner/subscriptions" />),
    page("handover/pickup", <AliasRedirect to="/owner/subscriptions" />),
    page("handover/return", <AliasRedirect to="/owner/subscriptions" />),
    page("orders/CDB-ORD-20261026-904", <AliasRedirect to="/owner/subscriptions" />),
    page("orders/CDB-ORD-20261026-904/confirmed", <AliasRedirect to="/owner/subscriptions" />),
];
