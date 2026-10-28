import { useSearchParams } from "react-router";

import { OrderDetail } from "@/components/bookings/OrderDetail.jsx";

export function OrderDetailPage({ orderId }) {
    const created = useSearchParams()[0].get("created") === "1";
    return <OrderDetail orderId={orderId} justCreated={created}/>;
}
