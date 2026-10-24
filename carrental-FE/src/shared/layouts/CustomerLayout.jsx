import { useLayoutEffect } from "react";
import { Outlet, ScrollRestoration, useMatches } from "react-router";
import { Header } from "@/shared/components/Header.jsx";
import { Interactions } from "@/shared/components/Interactions.jsx";
import { ReferenceFooter } from "@/shared/components/ReferenceFooter.jsx";

export default function CustomerLayout() {
    const title = useMatches().at(-1)?.handle?.title;
    useLayoutEffect(() => {
        document.title = title ? `${title} | CarDB` : "CarDB — Đồng hành mọi chuyến đi";
    }, [title]);
    return <>
        <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
        <Header />
        <Interactions><div id="noi-dung"><Outlet /></div><ReferenceFooter /></Interactions>
        <ScrollRestoration getKey={location => location.pathname} />
    </>;
}
