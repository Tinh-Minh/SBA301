import { Header } from "@/components/Header.jsx";
import { ReferenceFooter } from "@/components/ReferenceFooter.jsx";
import { Interactions } from "@/components/Interactions.jsx";
import { AuthProvider } from "@/components/AuthProvider.jsx";
import "@/styles/globals.css";
export const metadata = {
    title: { default: "CarDB — Đồng hành mọi chuyến đi", template: "%s | CarDB" },
    description: "Thuê xe tự lái, xe cao cấp theo ngày và theo giờ. Đội xe đời mới, giá minh bạch, giao xe tận nơi cùng CarDB.",
    icons: { icon: "/icon.svg" },
};
export const viewport = { themeColor: "#FC6C26" };
export default function RootLayout({ children }) {
    return <html lang="vi"><body className="bg-surface-canvas font-body-md text-body-md text-on-surface antialiased">
    <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
    <AuthProvider><Header />
    <Interactions><div id="noi-dung">{children}</div><ReferenceFooter /></Interactions></AuthProvider>
  </body></html>;
}
