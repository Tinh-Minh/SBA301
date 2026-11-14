import { useLayoutEffect } from "react";
import { useLocation } from "react-router";
import { Header } from "@/components/Header.jsx";
import { Interactions } from "@/components/Interactions.jsx";
import { ReferenceFooter } from "@/components/ReferenceFooter.jsx";
import { CursorTrail } from "@/components/CursorTrail.jsx";

/** Video nền (bãi biển) cho các trang bên trong, phủ lớp kem mờ để chữ và thẻ trắng vẫn dễ đọc. */
function AppBackground() {
    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    return <div className="app-bg" aria-hidden="true">
        {reduced ? null : <video className="app-bg-video" src="/videos/app-bg.mp4" poster="/images/app-bg-poster.jpg" autoPlay muted loop playsInline preload="auto"/>}
    </div>;
}

// "home": trang chủ giữ nguyên thiết kế cũ; "console": khu chủ xe/admin; "app": các màn còn lại.
function surfaceOf(pathname) {
    if (pathname === "/") return "home";
    if (pathname === "/login" || pathname === "/register") return "auth";
    if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) return "console";
    return "app";
}

export default function CustomerLayout({ children }) {
    const surface = surfaceOf(useLocation().pathname);
    useLayoutEffect(() => {
        document.documentElement.dataset.surface = surface;
    }, [surface]);
    return <>
        <a href="#noi-dung" className="skip-link">Đến nội dung chính</a>
        <Header />
        <Interactions><div id="noi-dung">{children}</div>{surface === "console" ? null : <ReferenceFooter />}</Interactions>
        {surface === "app" || surface === "console" ? <AppBackground /> : null}
        <CursorTrail />
    </>;
}
