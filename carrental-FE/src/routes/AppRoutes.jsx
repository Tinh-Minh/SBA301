import { RouterProvider } from "react-router/dom";
import { createBrowserRouter, redirect } from "react-router";
import MainLayout from "@/layouts/MainLayout.jsx";
import { InformationPage } from "@/pages/InformationPage.jsx";
import { screenLoaders } from "@/routes/pageLoaders.js";
import { pageTitles } from "@/routes/routes.constants.js";
import { routeAliases } from "@/routes/route-aliases.js";
import NotFound from "@/pages/NotFoundPage.jsx";
const screens = Object.entries(screenLoaders).map(([path, load]) => ({
    ...(path ? { path } : { index: true }),
    lazy: async () => ({ Component: (await load()).default }),
    handle: { title: pageTitles[path] },
}));
const information = Object.entries(pageTitles)
    .filter(([path]) => !screenLoaders[path] && !routeAliases[path])
    .map(([path, title]) => ({ path, element: <InformationPage slug={path} title={title}/>, handle: { title } }));
const aliases = Object.entries(routeAliases).map(([path, destination]) => ({
    path,
    loader: ({ request }) => redirect(destination + new URL(request.url).search),
}));
export const router = createBrowserRouter([{
        element: <MainLayout />,
        HydrateFallback: () => <div role="status" className="grid min-h-screen place-items-center bg-page-bg text-sm text-text-secondary">Đang tải trang…</div>,
        children: [...screens, ...information, ...aliases, { path: "*", element: <NotFound />, handle: { title: "Không tìm thấy trang" } }],
    }]);

export default function AppRoutes() {
    return <RouterProvider router={router} />;
}
