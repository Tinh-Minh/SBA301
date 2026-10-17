import { useLayoutEffect } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router";
import { Header } from "./components/header";
import { ReferenceFooter } from "./components/reference-footer";
import { Interactions } from "./components/interactions";
import { AuthProvider } from "./components/auth-provider";
export function App() {
    const matches = useMatches();
    const title = matches.at(-1)?.handle?.title;
    useLayoutEffect(() => { document.title = title ? `${title} | CarDB` : "CarDB — Đồng hành mọi chuyến đi"; }, [title]);
    return <AuthProvider>
    <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
    <Header />
    <Interactions><div id="noi-dung"><Outlet /></div><ReferenceFooter /></Interactions>
    <ScrollRestoration />
  </AuthProvider>;
}
