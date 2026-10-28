import { useLayoutEffect } from "react";
import { createBrowserRouter, RouterProvider, Outlet, ScrollRestoration, useMatches } from "react-router";
import CustomerLayout from "@/components/layouts/CustomerLayout.jsx";
import NotFoundPage from "@/pages/information/NotFoundPage.jsx";
import { InformationPage } from "@/components/information/components/InformationPage.jsx";
import { pageTitles } from "@/routes/paths.js";
import { routeAliases } from "@/routes/aliases.js";
import { AliasRedirect } from "@/routes/elements.jsx";
import { publicPages } from "@/routes/public.routes.jsx";
import { customerPages } from "@/routes/customer.routes.jsx";
import { AdminRoute, adminPages } from "@/routes/admin.routes.jsx";
import { OwnerRoute, ownerPages } from "@/routes/owner.routes.jsx";

function ApplicationRoute() {
    const title = useMatches().at(-1)?.handle?.title;
    useLayoutEffect(() => {
        document.title = title ? `${title} | CarDB` : "CarDB — Đồng hành mọi chuyến đi";
    }, [title]);
    return <CustomerLayout><Outlet /><ScrollRestoration getKey={location => location.pathname} /></CustomerLayout>;
}

const knownPaths = new Set([...publicPages, ...customerPages, ...adminPages, ...ownerPages].map(route => route.path));
const router = createBrowserRouter([{ element: <ApplicationRoute />, children: [
    ...publicPages,
    ...customerPages,
    { element: <AdminRoute />, children: adminPages },
    { element: <OwnerRoute />, children: ownerPages },
    ...Object.entries(routeAliases).filter(([path]) => !knownPaths.has(path.slice(1))).map(([path, to]) => ({
        path: path.slice(1).replace(":path*", "*"), element: <AliasRedirect to={to} />,
    })),
    ...Object.entries(pageTitles).filter(([path]) => !knownPaths.has(path) && !path.startsWith("cars/") && !path.startsWith("orders/")).map(([path, title]) => ({
        path, element: <InformationPage slug={path} title={title} />, handle: { title },
    })),
    { path: "*", element: <NotFoundPage />, handle: { title: "Không tìm thấy trang" } },
] }]);

export default function AppRoutes() { return <RouterProvider router={router} />; }
