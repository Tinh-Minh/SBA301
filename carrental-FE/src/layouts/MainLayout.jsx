import { useLayoutEffect } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router";
import { AuthProvider } from "@/components/AuthProvider.jsx";
import { Header } from "@/components/Header.jsx";
import { Interactions } from "@/components/Interactions.jsx";
import { ReferenceFooter } from "@/components/ReferenceFooter.jsx";

export default function MainLayout() {
    const title = useMatches().at(-1)?.handle?.title;
    useLayoutEffect(() => {
        document.title = title ? `${title} | CarDB` : "CarDB — Đồng hành mọi chuyến đi";
    }, [title]);
    return <AuthProvider>
        <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
        <Header />
        <Interactions><div id="noi-dung"><Outlet /></div><ReferenceFooter /></Interactions>
        <ScrollRestoration getKey={location => location.pathname} />
    </AuthProvider>;
}
