import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { ReferenceFooter } from "@/components/reference-footer";
import { Interactions } from "@/components/interactions";
import { AuthProvider } from "@/components/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CarDB — Đồng hành mọi chuyến đi", template: "%s | CarDB" },
  description: "Thuê xe tự lái, xe cao cấp theo ngày và theo giờ. Đội xe đời mới, giá minh bạch, giao xe tận nơi cùng CarDB.",
  icons: { icon: "/icon.svg" },
};
export const viewport: Viewport = { themeColor: "#FC6C26" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="vi"><body className="bg-surface-canvas font-body-md text-body-md text-on-surface antialiased">
    <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
    <AuthProvider><Header />
    <Interactions><div id="noi-dung">{children}</div><ReferenceFooter /></Interactions></AuthProvider>
  </body></html>;
}
