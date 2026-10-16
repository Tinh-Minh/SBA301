import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { screens } from "@/lib/screens";
import { pageTitles } from "@/lib/pages";
import { InformationPage } from "@/components/information-page";

const aliases: Record<string, string> = { "trang-chu": "/", "thue-xe-tu-lai": "/kham-pha-xe", "dang-nhap-dat-xe": "/dang-nhap", "thanh-toan-dat-coc": "/thanh-toan", "bang-gia-dong-xe": "/kham-pha-xe", "xe-kem-tai-xe": "/kham-pha-xe", "uu-dai": "/kham-pha-xe", "ve-kanow": "/lien-he", "ho-so-ca-nhan": "/tai-khoan", "xac-minh-giay-to": "/tai-khoan/xac-minh", "ho-so-tai-xe": "/tai-khoan/ho-so-tai-xe", "tai-khoan-ngan-hang": "/tai-khoan/ngan-hang", "don-thue-xe": "/tai-khoan/don-thue", "lich-su-chuyen-di": "/tai-khoan/lich-su" };
type Props = { params: Promise<{ slug?: string[] }> };
export function generateStaticParams() { return Object.keys(pageTitles).map(path => ({ slug: path ? path.split("/") : [] })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { return { title: pageTitles[(await params).slug?.join("/") ?? ""] ?? "Không tìm thấy trang" }; }
export default async function Page({ params }: Props) {
  const path = (await params).slug?.join("/") ?? "";
  if (aliases[path]) redirect(aliases[path]);
  const Screen = screens[path];
  if (Screen) return <Screen />;
  if (pageTitles[path]) return <InformationPage slug={path} title={pageTitles[path]} />;
  notFound();
}
