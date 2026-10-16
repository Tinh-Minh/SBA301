import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Home from "@/views/Home";
import SelfDrive from "@/views/SelfDrive";
import Chauffeur from "@/views/Chauffeur";
import Pricing from "@/views/Pricing";
import Offers from "@/views/Offers";
import About from "@/views/About";
import Vehicle from "@/views/Vehicle";
import Driver from "@/views/Driver";
import Register from "@/views/Register";
import Login from "@/views/Login";
import Checkout from "@/views/Checkout";
import Account from "@/views/Account";
import HomeAlternate from "@/views/HomeAlternate";
import SelfDriveAlternate from "@/views/SelfDriveAlternate";
import ChauffeurAlternate from "@/views/ChauffeurAlternate";
import PricingAlternate from "@/views/PricingAlternate";
import { InformationPage } from "@/components/information-page";
import { pageTitles } from "@/lib/pages";

const screens: Record<string, React.ComponentType> = {
  "": Home, "thue-xe-tu-lai": SelfDrive, "xe-kem-tai-xe": Chauffeur,
  "bang-gia-dong-xe": Pricing, "uu-dai": Offers, "ve-kanow": About,
  "xe/vinfast-vf8-plus-2024": Vehicle, "tai-xe/tran-minh-tuan": Driver,
  "dang-ky": Register, "dang-nhap": Login, "thanh-toan-dat-coc": Checkout,
  "tai-khoan": Account, "mau-thiet-ke/trang-chu": HomeAlternate,
  "mau-thiet-ke/tu-lai": SelfDriveAlternate, "mau-thiet-ke/tai-xe": ChauffeurAlternate,
  "mau-thiet-ke/bang-gia": PricingAlternate,
};

type Props = { params: Promise<{ slug?: string[] }> };
export function generateStaticParams() { return Object.keys(pageTitles).map(path => ({ slug: path ? path.split("/") : [] })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = (await params).slug?.join("/") ?? "";
  return { title: pageTitles[path] ?? "Không tìm thấy trang" };
}
export default async function Page({ params }: Props) {
  const path = (await params).slug?.join("/") ?? "";
  if (path === "trang-chu") redirect("/");
  if (path === "dang-nhap-dat-xe") redirect("/dang-nhap");
  const Screen = screens[path];
  if (Screen) return <Screen />;
  if (pageTitles[path]) return <InformationPage slug={path} title={pageTitles[path]} />;
  notFound();
}
