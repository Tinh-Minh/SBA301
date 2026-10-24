import { Suspense } from "react";
import { Navigate, useLocation, useParams } from "react-router";
import NotFoundPage from "@/features/information/pages/NotFoundPage.jsx";
import { pageTitles } from "@/app/routes/paths.js";

function PendingPage() {
    return <p role="status" className="px-6 pt-28 text-sm text-text-secondary">Đang tải trang…</p>;
}
export function AliasRedirect({ to }) {
    const location = useLocation();
    const params = useParams();
    const pathname = to.replace(":path*", params["*"] || "").replace(":id", params.id || "");
    return <Navigate replace to={pathname + location.search + location.hash} />;
}
export function CarRoute({ Screen }) {
    const { id } = useParams();
    return /^\d+$/.test(id) ? <Screen carId={id} /> : <Navigate replace to="/explore" />;
}
export function EditCarRoute({ Screen }) {
    const { id } = useParams();
    const carId = Number(id);
    return Number.isSafeInteger(carId) && carId > 0 ? <Screen carId={carId} /> : <NotFoundPage />;
}
export function OrderRoute({ Screen }) {
    const { id } = useParams();
    return <Screen orderId={id} />;
}

export function page(path, element, title = pageTitles[path]) {
    return {
        path,
        element: <Suspense fallback={<PendingPage />}>{element}</Suspense>,
        handle: { title },
    };
}

