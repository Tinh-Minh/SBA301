import { notFound, redirect } from "next/navigation";
import { screens } from "@/lib/screens";
import { pageTitles } from "@/lib/pages";
import { InformationPage } from "@/components/information-page";
const aliases = { "trang-chu": "/", "thue-xe-tu-lai": "/kham-pha-xe", "dang-nhap-dat-xe": "/dang-nhap", "thanh-toan-dat-coc": "/thanh-toan", "bang-gia-dong-xe": "/cach-tinh-gia", "xe-kem-tai-xe": "/kham-pha-xe", "uu-dai": "/kham-pha-xe", "ve-kanow": "/lien-he", "ho-so-ca-nhan": "/tai-khoan", "xac-minh-giay-to": "/tai-khoan/xac-minh", "ho-so-tai-xe": "/tai-khoan/ho-so-tai-xe", "tai-khoan-ngan-hang": "/tai-khoan/ngan-hang", "don-thue-xe": "/tai-khoan/don-thue", "lich-su-chuyen-di": "/tai-khoan/lich-su" };
const liveRoutes = new Set(["kham-pha-xe", "tai-khoan", "tai-khoan/don-thue", "tai-khoan/lich-su", "tai-khoan/xac-minh", "tai-khoan/xac-minh/thu-gon", "tai-khoan/ho-so-tai-xe", "tai-khoan/ngan-hang", "tai-khoan/ngan-hang/them", "tai-khoan/ngan-hang/mac-dinh", "dat-xe/xac-nhan", "dat-xe/thanh-cong", "chuyen-xe-cua-toi", "thanh-toan", "ban-giao/nhan-xe", "ban-giao/tra-xe", "danh-gia", "tranh-chap"]);
export function generateStaticParams() {
    return Object.keys(pageTitles).filter(path => !liveRoutes.has(path) && !path.startsWith("xe/") && !path.startsWith("don-thue/")).map(path => ({ slug: path ? path.split("/") : [] }));
}
export async function generateMetadata({ params }) { return { title: pageTitles[(await params).slug?.join("/") ?? ""] ?? "Không tìm thấy trang" }; }
export default async function Page({ params }) {
    const path = (await params).slug?.join("/") ?? "";
    const designAliases = { "booking-detail-c08": "/chuyen-xe-cua-toi", "chi-tiet-don-thue": "/chuyen-xe-cua-toi", "handover-protocol-c10": "/chuyen-xe-cua-toi", "thanh-toan-lai": "/chuyen-xe-cua-toi", "privacy-policy": "/chinh-sach-bao-mat", "terms-of-service": "/dieu-khoan-su-dung" };
    if (aliases[path] || designAliases[path])
        redirect(aliases[path] || designAliases[path]);
    const Screen = screens[path];
    if (Screen)
        return <Screen />;
    if (pageTitles[path])
        return <InformationPage slug={path} title={pageTitles[path]}/>;
    notFound();
}
