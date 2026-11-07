import { lazy } from "react";
const BanksPage = lazy(() => import("@/pages/account/BanksPage.jsx"));
const DriverProfilePage = lazy(() => import("@/pages/account/DriverProfilePage.jsx"));
const ProfilePage = lazy(() => import("@/pages/account/ProfilePage.jsx"));
const VerificationPage = lazy(() => import("@/pages/account/VerificationPage.jsx"));
const DisputePage = lazy(() => import("@/pages/disputes/DisputePage.jsx"));
const PaymentPage = lazy(() => import("@/pages/payments/PaymentPage.jsx"));
const OwnerReviewPage = lazy(() => import("@/pages/reviews/OwnerReviewPage.jsx"));
import { page, AliasRedirect } from "@/routes/elements.jsx";

export const customerPages = [
    page("account", <ProfilePage />),
    page("account/bank", <BanksPage />),
    page("account/driver", <DriverProfilePage />),
    page("account/verification", <VerificationPage />),
    page("account/orders", <AliasRedirect to="/owner/subscriptions" />),
    page("account/history", <AliasRedirect to="/owner/subscriptions" />),
    page("my-trips", <AliasRedirect to="/owner/subscriptions" />),
    page("booking/confirm", <AliasRedirect to="/explore" />),
    page("orders/:id", <AliasRedirect to="/owner/subscriptions" />),
    page("payment", <PaymentPage />),
    page("reviews", <OwnerReviewPage />),
    page("disputes", <DisputePage />),
    page("account/bank/add", <AliasRedirect to="/account/bank" />),
    page("account/bank/default", <AliasRedirect to="/account/bank" />),
    page("account/verification/compact", <AliasRedirect to="/account/verification" />),
    page("booking/success", <AliasRedirect to="/owner/subscriptions" />),
    page("handover/pickup", <AliasRedirect to="/owner/subscriptions" />),
    page("handover/return", <AliasRedirect to="/owner/subscriptions" />),
    page("orders/CDB-ORD-20261026-904", <AliasRedirect to="/owner/subscriptions" />),
    page("orders/CDB-ORD-20261026-904/confirmed", <AliasRedirect to="/owner/subscriptions" />),
];
