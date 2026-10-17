import { ToastProvider } from "@/components/ToastProvider.jsx";
import { useLayoutEffect } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router";
import { Header } from "@/components/Header.jsx";
import { ReferenceFooter } from "@/components/ReferenceFooter.jsx";
import { Interactions } from "@/components/Interactions.jsx";
import { AuthProvider } from "@/components/AuthProvider.jsx";
export default function MainLayout() {
    const matches = useMatches();
    const title = matches.at(-1)?.handle?.title;
    useLayoutEffect(() => { document.title = title ? `${title} | CarDB` : "CarDB — Đồng hành mọi chuyến đi"; }, [title]);
    return <AuthProvider><ToastProvider>
    <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
    <Header />
    <Interactions className="app-layout"><div id="noi-dung"><Outlet /></div><ReferenceFooter /></Interactions>
    <ScrollRestoration />
  </ToastProvider></AuthProvider>;
}
