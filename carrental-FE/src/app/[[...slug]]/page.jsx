import { notFound, redirect } from "next/navigation";
import { screens } from "@/lib/screens";
import { pageTitles } from "@/lib/pages";
import { InformationPage } from "@/components/information-page";
const aliases = { "trang-chu": "/", "thue-xe-tu-lai": "/kham-pha-xe", "dang-nhap-dat-xe": "/dang-nhap", "thanh-toan-dat-coc": "/thanh-toan", "bang-gia-dong-xe": "/cach-tinh-gia", "xe-kem-tai-xe": "/kham-pha-xe", "uu-dai": "/kham-pha-xe", "ve-kanow": "/lien-he", "ho-so-ca-nhan": "/tai-khoan", "xac-minh-giay-to": "/tai-khoan/xac-minh", "ho-so-tai-xe": "/tai-khoan/ho-so-tai-xe", "tai-khoan-ngan-hang": "/tai-khoan/ngan-hang", "don-thue-xe": "/tai-khoan/don-thue", "lich-su-chuyen-di": "/tai-khoan/lich-su" };
export function generateStaticParams() { return Object.keys(pageTitles).map(path => ({ slug: path ? path.split("/") : [] })); }
export async function generateMetadata({ params }) { return { title: pageTitles[(await params).slug?.join("/") ?? ""] ?? "Không tìm thấy trang" }; }
export default async function Page({ params }) {
    const path = (await params).slug?.join("/") ?? "";
    const designAliases = { "booking-detail-c08": "/don-thue/CDB-ORD-20261026-904", "chi-tiet-don-thue": "/don-thue/CDB-ORD-20261026-904", "handover-protocol-c10": "/ban-giao/nhan-xe", "thanh-toan-lai": "/thanh-toan", "privacy-policy": "/chinh-sach-bao-mat", "terms-of-service": "/dieu-khoan-su-dung" };
    if (aliases[path] || designAliases[path])
        redirect(aliases[path] || designAliases[path]);
    const Screen = screens[path];
    if (Screen)
        return <Screen />;
    if (pageTitles[path])
        return <InformationPage slug={path} title={pageTitles[path]}/>;
    notFound();
}
