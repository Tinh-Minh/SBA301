import { createBrowserRouter, redirect, type RouteObject } from "react-router";
import { App } from "./app";
import { InformationPage } from "./components/information-page";
import { screenLoaders } from "./lib/screens";
import { pageTitles } from "./lib/pages";
import { routeAliases } from "./lib/route-aliases";
import NotFound from "./views/NotFound";

const screens: RouteObject[] = Object.entries(screenLoaders).map(([path, load]) => ({
  ...(path ? { path } : { index: true }),
  lazy: async () => ({ Component: (await load()).default }),
  handle: { title: pageTitles[path] },
}));

const information: RouteObject[] = Object.entries(pageTitles)
  .filter(([path]) => !screenLoaders[path] && !routeAliases[path])
  .map(([path, title]) => ({ path, element: <InformationPage slug={path} title={title} />, handle: { title } }));

const aliases: RouteObject[] = Object.entries(routeAliases).map(([path, destination]) => ({
  path,
  loader: ({ request }) => redirect(destination + new URL(request.url).search),
}));

export const router = createBrowserRouter([{
  element: <App />,
  children: [...screens, ...information, ...aliases, { path: "*", element: <NotFound />, handle: { title: "Không tìm thấy trang" } }],
}]);
