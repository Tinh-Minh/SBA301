import { notFound, redirect } from "next/navigation";
import { screens } from "@/routes/screens.js";
import { pageTitles } from "@/routes/routes.constants.js";
import { InformationPage } from "@/components/InformationPage.jsx";
const aliases = { "trang-chu": "/", "thue-xe-tu-lai": "/explore", "dang-nhap-dat-xe": "/login", "thanh-toan-dat-coc": "/payment", "bang-gia-dong-xe": "/pricing", "xe-kem-tai-xe": "/explore", "uu-dai": "/explore", "ve-kanow": "/contact", "ho-so-ca-nhan": "/account", "xac-minh-giay-to": "/account/verification", "ho-so-tai-xe": "/account/driver", "tai-khoan-ngan-hang": "/account/bank", "don-thue-xe": "/account/orders", "lich-su-chuyen-di": "/account/history" };
const liveRoutes = new Set(["explore", "account", "account/orders", "account/history", "account/verification", "account/verification/compact", "account/driver", "account/bank", "account/bank/add", "account/bank/default", "booking/confirm", "booking/success", "my-trips", "payment", "handover/pickup", "handover/return", "reviews", "disputes"]);
export function generateStaticParams() {
    return Object.keys(pageTitles).filter(path => !liveRoutes.has(path) && !path.startsWith("cars/") && !path.startsWith("orders/")).map(path => ({ slug: path ? path.split("/") : [] }));
}
export async function generateMetadata({ params }) { return { title: pageTitles[(await params).slug?.join("/") ?? ""] ?? "Không tìm thấy trang" }; }
export default async function Page({ params }) {
    const path = (await params).slug?.join("/") ?? "";
    const designAliases = { "booking-detail-c08": "/my-trips", "chi-tiet-don-thue": "/my-trips", "handover-protocol-c10": "/my-trips", "thanh-toan-lai": "/my-trips", "privacy-policy": "/privacy", "terms-of-service": "/terms" };
    if (aliases[path] || designAliases[path])
        redirect(aliases[path] || designAliases[path]);
    const Screen = screens[path];
    if (Screen)
        return <Screen />;
    if (pageTitles[path])
        return <InformationPage slug={path} title={pageTitles[path]}/>;
    notFound();
}
